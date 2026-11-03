package com.gnt.backend.admin;

import com.gnt.backend.auth.repository.UserRepository;
import com.gnt.backend.credit.CreditLedger;
import com.gnt.backend.domain.entity.Product;
import com.gnt.backend.domain.entity.ProductMedia;
import com.gnt.backend.domain.entity.StaffAuditLog;
import com.gnt.backend.domain.entity.User;
import com.gnt.backend.domain.enums.Category;
import com.gnt.backend.domain.enums.Condition;
import com.gnt.backend.domain.enums.CreditHistoryType;
import com.gnt.backend.domain.enums.MediaType;
import com.gnt.backend.domain.enums.ProductStatus;
import com.gnt.backend.exception.ApiException;
import com.gnt.backend.product.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Lists a starter set of items under the owner who asks for them, so a new marketplace isn't
 * empty. They are ordinary listings: the owner earns the normal 40% reward, handles any
 * reservations, and can remove them like any other listing. Adding them twice does nothing.
 */
@Service
public class SampleListings {

    private record Sample(String title, Category category, Condition condition, int credits, String image, String description) {}

    private static final List<Sample> SAMPLES = List.of(
            new Sample("Canon AE-1 film camera", Category.ELECTRONICS, Condition.GOOD, 420, "camera",
                    "A working AE-1 with a 50mm f/1.8 lens. The light meter reads true; a little brassing on the top plate."),
            new Sample("Hand-thrown stoneware dinner set", Category.KITCHEN_ITEMS, Condition.LIKE_NEW, 260, "ceramics",
                    "Six plates and six bowls in a speckled oat glaze. Used twice and stored since."),
            new Sample("Solid teak reading chair", Category.FURNITURE, Condition.GOOD, 680, "chair",
                    "Mid-century frame with new linen cushions. Sturdy, comfortable and heavy, so bring a friend."),
            new Sample("Modern classics, 12 hardbacks", Category.BOOKS, Condition.LIKE_NEW, 180, "books",
                    "Dust jackets intact, spines uncreased. Woolf, Baldwin, Calvino, Marquez and more."),
            new Sample("Waxed canvas field jacket", Category.CLOTHES, Condition.GOOD, 240, "jacket",
                    "Size M, corduroy collar, recently re-waxed. Worn in the best way."),
            new Sample("Full-grain leather boots", Category.SHOES, Condition.LIKE_NEW, 300, "boots",
                    "UK 9, Goodyear welted, worn a handful of times. Resoleable for years to come."),
            new Sample("Oak building blocks, 80 pieces", Category.TOYS, Condition.GOOD, 120, "blocks",
                    "Unfinished solid oak, sanded smooth and kept in a cotton bag."),
            new Sample("Brass desk lamp", Category.ACCESSORIES, Condition.NEW, 150, "lamp",
                    "Unused and still boxed. Adjustable arm with a warm LED bulb included.")
    );

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final CreditLedger creditLedger;
    private final StaffAuditLogRepository auditRepository;

    public SampleListings(UserRepository userRepository, ProductRepository productRepository,
                          CreditLedger creditLedger, StaffAuditLogRepository auditRepository) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.creditLedger = creditLedger;
        this.auditRepository = auditRepository;
    }

    /** @return how many listings were created (0 if they all exist already) */
    @Transactional
    public int addFor(Long ownerId) {
        User owner = userRepository.findById(ownerId).orElseThrow(() -> ApiException.notFound("Member not found"));

        int created = 0;
        for (Sample sample : SAMPLES) {
            if (productRepository.existsByOwnerIdAndTitle(ownerId, sample.title())) {
                continue;
            }
            Product product = new Product();
            product.setOwner(owner);
            product.setTitle(sample.title());
            product.setDescription(sample.description());
            product.setCategory(sample.category());
            product.setCondition(sample.condition());
            product.setCreditValue(sample.credits());
            product.setListingBonus(sample.credits() * 40 / 100);
            // Pickup at the owner's own address when they have one.
            product.setStreet(orDefault(owner.getStreet(), "Address shared after reserving"));
            product.setCity(orDefault(owner.getCity(), "Pune"));
            product.setState(orDefault(owner.getState(), "Maharashtra"));
            product.setPostalCode(orDefault(owner.getPostalCode(), "411001"));
            product.setCountry(orDefault(owner.getCountry(), "India"));
            product.setStatus(ProductStatus.ACTIVE);

            ProductMedia media = new ProductMedia();
            media.setProduct(product);
            media.setMediaUrl("/samples/" + sample.image() + ".svg");
            media.setMediaType(MediaType.IMAGE);
            media.setPrimary(true);
            product.getMedia().add(media);

            Product saved = productRepository.save(product);
            creditLedger.apply(ownerId, saved.getListingBonus(), CreditHistoryType.PRODUCT_APPROVED,
                    "Listing reward (40%): " + saved.getTitle(), null);
            created++;
        }

        if (created > 0) {
            StaffAuditLog entry = new StaffAuditLog();
            entry.setActor(owner);
            entry.setAction("SAMPLE_LISTINGS_ADDED");
            entry.setTargetType("USER");
            entry.setTargetId(ownerId);
            entry.setDetails("Listed " + created + " sample items");
            auditRepository.save(entry);
        }
        return created;
    }

    private static String orDefault(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }
}
