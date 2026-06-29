package com.gnt.backend.product.service;

import com.gnt.backend.auth.repository.UserRepository;
import com.gnt.backend.domain.entity.CreditHistory;
import com.gnt.backend.domain.entity.Product;
import com.gnt.backend.domain.entity.ProductImage;
import com.gnt.backend.domain.entity.User;
import com.gnt.backend.domain.enums.Category;
import com.gnt.backend.domain.enums.Condition;
import com.gnt.backend.domain.enums.CreditHistoryType;
import com.gnt.backend.domain.enums.ProductStatus;
import com.gnt.backend.auth.repository.CreditHistoryRepository;
import com.gnt.backend.product.dto.ProductImageRequest;
import com.gnt.backend.product.dto.ProductListResponse;
import com.gnt.backend.product.dto.ProductRequest;
import com.gnt.backend.product.dto.ProductResponse;
import com.gnt.backend.product.mapper.ProductMapper;
import com.gnt.backend.product.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CreditHistoryRepository creditHistoryRepository;
    private final ProductMapper productMapper;

    public ProductServiceImpl(
            ProductRepository productRepository,
            UserRepository userRepository,
            CreditHistoryRepository creditHistoryRepository,
            ProductMapper productMapper) {
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.creditHistoryRepository = creditHistoryRepository;
        this.productMapper = productMapper;
    }

    @Override
    @Transactional
    public ProductResponse createProduct(ProductRequest request, Long ownerId) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Product product = new Product();
        product.setOwner(owner);
        product.setTitle(request.title());
        product.setDescription(request.description());
        product.setCategory(request.category());
        product.setCondition(request.condition());
        product.setCreditValue(request.creditValue());
        product.setPickupAddress(request.pickupAddress());
        
        // MVP: Auto-approve newly created products
        product.setStatus(ProductStatus.ACTIVE);

        setImages(product, request.images());

        Product savedProduct = productRepository.save(product);

        // MVP: Give 50% credit on approval
        int approvalBonus = request.creditValue() / 2;
        owner.setCreditBalance(owner.getCreditBalance() + approvalBonus);
        userRepository.save(owner);

        CreditHistory history = new CreditHistory();
        history.setUser(owner);
        history.setAmount(approvalBonus);
        history.setTransactionType(CreditHistoryType.PRODUCT_APPROVED);
        history.setDescription("Received 50% credit value for product approval: " + savedProduct.getTitle());
        creditHistoryRepository.save(history);

        return productMapper.toResponse(savedProduct);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return productMapper.toResponse(product);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductListResponse> getActiveProducts(Category category, Condition condition, Pageable pageable) {
        return productRepository.findProductsWithFilters(ProductStatus.ACTIVE, category, condition, pageable)
                .map(productMapper::toListResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductListResponse> getUserProducts(Long ownerId, Pageable pageable) {
        return productRepository.findByOwnerIdOrderByCreatedAtDesc(ownerId, pageable)
                .map(productMapper::toListResponse);
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request, Long ownerId) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.getOwner().getId().equals(ownerId)) {
            throw new RuntimeException("Unauthorized to update this product");
        }
        
        if (product.getStatus() == ProductStatus.LOCKED || product.getStatus() == ProductStatus.EXCHANGED) {
            throw new RuntimeException("Cannot update a locked or exchanged product");
        }

        product.setTitle(request.title());
        product.setDescription(request.description());
        product.setCategory(request.category());
        product.setCondition(request.condition());
        product.setPickupAddress(request.pickupAddress());
        
        // Note: we don't allow changing creditValue on an active product easily without re-adjusting credits,
        // For MVP we allow it but don't do credit adjustments to keep it simple.
        product.setCreditValue(request.creditValue());

        product.getImages().clear();
        setImages(product, request.images());

        return productMapper.toResponse(productRepository.save(product));
    }

    @Override
    @Transactional
    public void deleteProduct(Long id, Long ownerId) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.getOwner().getId().equals(ownerId)) {
            throw new RuntimeException("Unauthorized to delete this product");
        }

        if (product.getStatus() == ProductStatus.LOCKED || product.getStatus() == ProductStatus.EXCHANGED) {
            throw new RuntimeException("Cannot delete a locked or exchanged product");
        }

        product.setStatus(ProductStatus.DELETED);
        productRepository.save(product);
    }

    private void setImages(Product product, List<ProductImageRequest> imageRequests) {
        List<ProductImage> images = imageRequests.stream().map(req -> {
            ProductImage img = new ProductImage();
            img.setProduct(product);
            img.setImageUrl(req.imageUrl());
            img.setPrimary(req.isPrimary());
            img.setDisplayOrder(req.displayOrder());
            return img;
        }).collect(Collectors.toList());
        
        product.getImages().addAll(images);
    }
}
