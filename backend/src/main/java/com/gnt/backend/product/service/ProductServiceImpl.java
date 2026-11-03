package com.gnt.backend.product.service;

import com.gnt.backend.auth.repository.UserRepository;
import com.gnt.backend.credit.CreditLedger;
import com.gnt.backend.domain.entity.Product;
import com.gnt.backend.domain.entity.ProductMedia;
import com.gnt.backend.domain.entity.User;
import com.gnt.backend.domain.enums.Category;
import com.gnt.backend.domain.enums.Condition;
import com.gnt.backend.domain.enums.CreditHistoryType;
import com.gnt.backend.domain.enums.MediaType;
import com.gnt.backend.domain.enums.ProductStatus;
import com.gnt.backend.domain.enums.TransactionStatus;
import com.gnt.backend.exception.ApiException;
import com.gnt.backend.product.dto.ProductListResponse;
import com.gnt.backend.product.dto.ProductRequest;
import com.gnt.backend.product.dto.ProductResponse;
import com.gnt.backend.product.mapper.ProductMapper;
import com.gnt.backend.product.repository.ProductRepository;
import com.gnt.backend.transaction.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class ProductServiceImpl implements ProductService {

    private static final int LISTING_BONUS_PERCENT = 40;

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CreditLedger creditLedger;
    private final TransactionRepository transactionRepository;
    private final ProductMapper productMapper;
    private final ImageKitService imageKitService;
    private final int maxCreditValue;
    private final int maxActivePerUser;

    public ProductServiceImpl(
            ProductRepository productRepository,
            UserRepository userRepository,
            CreditLedger creditLedger,
            TransactionRepository transactionRepository,
            ProductMapper productMapper,
            ImageKitService imageKitService,
            @Value("${application.listing.max-credit-value}") int maxCreditValue,
            @Value("${application.listing.max-active-per-user}") int maxActivePerUser) {
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.creditLedger = creditLedger;
        this.transactionRepository = transactionRepository;
        this.productMapper = productMapper;
        this.imageKitService = imageKitService;
        this.maxCreditValue = maxCreditValue;
        this.maxActivePerUser = maxActivePerUser;
    }

    @Override
    @Transactional
    public ProductResponse createProduct(ProductRequest request, List<MultipartFile> files, Long ownerId) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> ApiException.notFound("User not found"));

        requireAllowedValue(request.creditValue());
        if (productRepository.countByOwnerIdAndStatus(ownerId, ProductStatus.ACTIVE) >= maxActivePerUser) {
            throw ApiException.conflict("You've reached the limit of " + maxActivePerUser + " active listings");
        }

        Product product = new Product();
        product.setOwner(owner);
        applyDetails(product, request);
        product.setCreditValue(request.creditValue());
        product.setListingBonus(listingBonusFor(request.creditValue()));

        // MVP: Auto-approve newly created products
        product.setStatus(ProductStatus.ACTIVE);

        addMedia(product, files);
        Product savedProduct = productRepository.save(product);

        creditLedger.apply(ownerId, savedProduct.getListingBonus(), CreditHistoryType.PRODUCT_APPROVED,
                "Listing reward (40%): " + savedProduct.getTitle(), null);

        return productMapper.toResponse(savedProduct, true);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id, Long requesterId) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Product not found"));

        boolean isOwner = requesterId != null && product.getOwner().getId().equals(requesterId);
        boolean ownerActive = product.getOwner().getStatus() == com.gnt.backend.domain.enums.UserStatus.ACTIVE;
        boolean publiclyVisible = ownerActive && product.getStatus() == ProductStatus.ACTIVE
                || product.getStatus() == ProductStatus.LOCKED
                || product.getStatus() == ProductStatus.EXCHANGED;
        // A reserved item stays reachable for its buyer even if the seller was suspended.
        if (!publiclyVisible && requesterId != null && product.getStatus() != ProductStatus.DELETED
                && transactionRepository.existsByProductIdAndBuyerIdAndStatusIn(product.getId(), requesterId,
                        List.of(TransactionStatus.INITIATED, TransactionStatus.WAITING_CONFIRMATION, TransactionStatus.COMPLETED))) {
            publiclyVisible = true;
        }
        if (product.getStatus() == ProductStatus.DELETED || (!publiclyVisible && !isOwner)) {
            throw ApiException.notFound("Product not found");
        }

        boolean canSeeFullAddress = isOwner || (requesterId != null
                && transactionRepository.existsByProductIdAndBuyerIdAndStatusIn(
                        product.getId(), requesterId,
                        List.of(TransactionStatus.INITIATED, TransactionStatus.WAITING_CONFIRMATION,
                                TransactionStatus.COMPLETED)));

        return productMapper.toResponse(product, canSeeFullAddress);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductListResponse> getActiveProducts(Category category, Condition condition, String query, Pageable pageable) {
        return productRepository.findProductsWithFilters(ProductStatus.ACTIVE, category, condition, toLikePattern(query), pageable)
                .map(productMapper::toListResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductListResponse> getUserProducts(Long ownerId, Pageable pageable) {
        return productRepository.findByOwnerIdAndStatusNotOrderByCreatedAtDesc(ownerId, ProductStatus.DELETED, pageable)
                .map(productMapper::toListResponse);
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request, List<MultipartFile> files, Long ownerId) {
        Product product = requireEditableListing(id, ownerId, "edit");
        requireAllowedValue(request.creditValue());

        applyDetails(product, request);
        reconcileListingBonus(product, request.creditValue());

        if (files != null && !files.isEmpty()) {
            // Upload first: a rejected file must leave the existing media untouched.
            List<ProductMedia> previous = new ArrayList<>(product.getMedia());
            product.getMedia().clear();
            addMedia(product, files);
            previous.forEach(media -> imageKitService.deleteMedia(media.getImagekitFileId()));
        }

        return productMapper.toResponse(productRepository.save(product), true);
    }

    @Override
    @Transactional
    public void deleteProduct(Long id, Long ownerId) {
        Product product = requireEditableListing(id, ownerId, "remove");
        int bonus = product.getListingBonus();

        creditLedger.apply(ownerId, -bonus, CreditHistoryType.LISTING_ADJUSTMENT,
                "Listing reward reversed: " + product.getTitle(), null,
                "You need " + bonus + " credits to remove this listing, because its listing reward is taken back");

        product.setListingBonus(0);
        product.setStatus(ProductStatus.DELETED);
    }

    private Product requireEditableListing(Long id, Long ownerId, String action) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Product not found"));

        if (!product.getOwner().getId().equals(ownerId)) {
            throw ApiException.forbidden("You can only " + action + " your own listings");
        }
        if (product.getStatus() == ProductStatus.LOCKED) {
            throw ApiException.conflict("You can't " + action + " an item while it's reserved");
        }
        if (product.getStatus() == ProductStatus.EXCHANGED || product.getStatus() == ProductStatus.DELETED) {
            throw ApiException.conflict("This listing has closed");
        }
        return product;
    }

    /** Keeps the owner's reward at 40% of the current value when a listing is repriced. */
    private void reconcileListingBonus(Product product, int newValue) {
        int newBonus = listingBonusFor(newValue);
        int difference = newBonus - product.getListingBonus();

        creditLedger.apply(product.getOwner().getId(), difference, CreditHistoryType.LISTING_ADJUSTMENT,
                "Listing reward adjusted after repricing: " + product.getTitle(), null,
                "You need " + (-difference) + " credits to lower this price, because part of the listing reward is taken back");

        product.setCreditValue(newValue);
        product.setListingBonus(newBonus);
    }

    private void requireAllowedValue(int creditValue) {
        if (creditValue > maxCreditValue) {
            throw ApiException.badRequest("Items can be listed for up to " + maxCreditValue + " credits");
        }
    }

    private static int listingBonusFor(int creditValue) {
        return creditValue * LISTING_BONUS_PERCENT / 100;
    }

    private static void applyDetails(Product product, ProductRequest request) {
        product.setTitle(request.title().trim());
        product.setDescription(request.description().trim());
        product.setCategory(request.category());
        product.setCondition(request.condition());
        product.setStreet(request.street());
        product.setCity(request.city());
        product.setState(request.state());
        product.setPostalCode(request.postalCode());
        product.setCountry(request.country());
    }

    private static String toLikePattern(String query) {
        if (query == null || query.isBlank()) {
            return null;
        }
        String escaped = query.trim().toLowerCase(Locale.ROOT)
                .replace("!", "!!")
                .replace("%", "!%")
                .replace("_", "!_");
        return "%" + escaped + "%";
    }

    private void addMedia(Product product, List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            throw new IllegalArgumentException("At least one media file is required");
        }
        if (files.size() > 5) {
            throw new IllegalArgumentException("Maximum of 5 media files allowed");
        }

        long videoCount = files.stream().filter(f -> {
            String contentType = f.getContentType();
            return contentType != null && contentType.startsWith("video/");
        }).count();

        if (videoCount > 1) {
            throw new IllegalArgumentException("Maximum of 1 video allowed per product");
        }
        if (files.size() - videoCount < 1) {
            throw new IllegalArgumentException("At least 1 image is required");
        }

        // Validate everything before the first upload so a bad file leaves nothing behind.
        files.forEach(MediaRules::validate);

        boolean primarySet = false;
        int displayOrder = 0;

        for (MultipartFile file : files) {
            ImageKitService.UploadResult result = imageKitService.uploadMedia(file);

            ProductMedia media = new ProductMedia();
            media.setProduct(product);
            media.setMediaUrl(result.url());
            media.setImagekitFileId(result.fileId());
            media.setMediaType(result.type());
            media.setDisplayOrder(displayOrder++);

            if (!primarySet && result.type() == MediaType.IMAGE) {
                media.setPrimary(true);
                primarySet = true;
            }

            product.getMedia().add(media);
        }
    }
}
