package com.gnt.backend.admin;

import com.gnt.backend.auth.repository.CreditHistoryRepository;
import com.gnt.backend.auth.repository.UserRepository;
import com.gnt.backend.credit.CreditLedger;
import com.gnt.backend.domain.entity.CreditHistory;
import com.gnt.backend.domain.entity.Product;
import com.gnt.backend.domain.entity.ProductMedia;
import com.gnt.backend.domain.entity.User;
import com.gnt.backend.domain.enums.Category;
import com.gnt.backend.domain.enums.Condition;
import com.gnt.backend.domain.enums.CreditHistoryType;
import com.gnt.backend.domain.enums.MediaType;
import com.gnt.backend.domain.enums.ProductStatus;
import com.gnt.backend.domain.enums.UserStatus;
import com.gnt.backend.product.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Lists the 8 starter products under two sample sellers on startup, so the market is never
 * empty. Controlled by SAMPLE_DATA (on by default).
 *
 * <p>Idempotent: existing sellers and products are left alone, so restarts never duplicate them,
 * and a sample that was deleted from the database comes back. Products removed in the app
 * (status DELETED or REJECTED) stay removed, because they still exist.
 *
 * <p>The sellers' password comes from SAMPLE_SELLER_PASSWORD. Without it they get a random
 * password nobody knows, so nobody can log in as them.
 */
@Component
public class SampleListings implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(SampleListings.class);
    private static final int STARTING_CREDITS = 350;

    private record Seller(String name, String email, String phone) {}

    private record Sample(Seller seller, String title, Category category, Condition condition, int credits,
                          String image, String city, String state, String description) {}

    private static final Seller ASHA = new Seller("Asha Rao", "asha@samples.giveandtake.invalid", "+910000000001");
    private static final Seller ROHAN = new Seller("Rohan Mehta", "rohan@samples.giveandtake.invalid", "+910000000002");

    private static final List<Sample> SAMPLES = List.of(
            new Sample(ASHA, "Canon AE-1 film camera", Category.ELECTRONICS, Condition.GOOD, 420, "camera",
                    "Bengaluru", "Karnataka",
                    "A working AE-1 with a 50mm f/1.8 lens. The light meter reads true; a little brassing on the top plate."),
            new Sample(ASHA, "Hand-thrown stoneware dinner set", Category.KITCHEN_ITEMS, Condition.LIKE_NEW, 260, "ceramics",
                    "Bengaluru", "Karnataka", "Six plates and six bowls in a speckled oat glaze. Used twice and stored since."),
            new Sample(ROHAN, "Solid teak reading chair", Category.FURNITURE, Condition.GOOD, 680, "chair",
                    "Pune", "Maharashtra", "Mid-century frame with new linen cushions. Sturdy, comfortable and heavy, so bring a friend."),
            new Sample(ROHAN, "Modern classics, 12 hardbacks", Category.BOOKS, Condition.LIKE_NEW, 180, "books",
                    "Pune", "Maharashtra", "Dust jackets intact, spines uncreased. Woolf, Baldwin, Calvino, Marquez and more."),
            new Sample(ASHA, "Waxed canvas field jacket", Category.CLOTHES, Condition.GOOD, 240, "jacket",
                    "Mysuru", "Karnataka", "Size M, corduroy collar, recently re-waxed. Worn in the best way."),
            new Sample(ROHAN, "Full-grain leather boots", Category.SHOES, Condition.LIKE_NEW, 300, "boots",
                    "Mumbai", "Maharashtra", "UK 9, Goodyear welted, worn a handful of times. Resoleable for years to come."),
            new Sample(ASHA, "Oak building blocks, 80 pieces", Category.TOYS, Condition.GOOD, 120, "blocks",
                    "Mysuru", "Karnataka", "Unfinished solid oak, sanded smooth and kept in a cotton bag."),
            new Sample(ROHAN, "Brass desk lamp", Category.ACCESSORIES, Condition.NEW, 150, "lamp",
                    "Mumbai", "Maharashtra", "Unused and still boxed. Adjustable arm with a warm LED bulb included.")
    );

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final CreditHistoryRepository creditHistoryRepository;
    private final CreditLedger creditLedger;
    private final PasswordEncoder passwordEncoder;
    private final boolean enabled;
    private final String sellerPassword;

    public SampleListings(UserRepository userRepository,
                          ProductRepository productRepository,
                          CreditHistoryRepository creditHistoryRepository,
                          CreditLedger creditLedger,
                          PasswordEncoder passwordEncoder,
                          @Value("${application.sample-data.enabled:true}") boolean enabled,
                          @Value("${application.sample-data.seller-password:}") String sellerPassword) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.creditHistoryRepository = creditHistoryRepository;
        this.creditLedger = creditLedger;
        this.passwordEncoder = passwordEncoder;
        this.enabled = enabled;
        this.sellerPassword = sellerPassword;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!enabled) {
            return;
        }
        int created = 0;
        for (Sample sample : SAMPLES) {
            User seller = seller(sample.seller());
            if (!productRepository.existsByOwnerIdAndTitle(seller.getId(), sample.title())) {
                list(seller, sample);
                created++;
            }
        }
        if (created > 0) {
            log.info("Listed {} sample products", created);
        }
    }

    private User seller(Seller seller) {
        return userRepository.findByEmail(seller.email()).orElseGet(() -> {
            String password = sellerPassword.isBlank() ? UUID.randomUUID().toString() : sellerPassword;
            User user = new User();
            user.setName(seller.name());
            user.setEmail(seller.email());
            user.setPhone(seller.phone());
            user.setPassword(passwordEncoder.encode(password));
            user.setDateOfBirth(LocalDate.of(1995, 1, 1));
            user.setCreditBalance(STARTING_CREDITS);
            user.setRating(BigDecimal.ZERO);
            user.setStatus(UserStatus.ACTIVE);
            user.setHasSeenWelcome(true);
            User saved = userRepository.save(user);

            // Same as a normal sign-up, so the ledger explains the whole balance.
            CreditHistory bonus = new CreditHistory();
            bonus.setUser(saved);
            bonus.setAmount(STARTING_CREDITS);
            bonus.setTransactionType(CreditHistoryType.INITIAL_BONUS);
            bonus.setDescription("Welcome bonus — initial credit allocation.");
            creditHistoryRepository.save(bonus);
            return saved;
        });
    }

    private void list(User seller, Sample sample) {
        Product product = new Product();
        product.setOwner(seller);
        product.setTitle(sample.title());
        product.setDescription(sample.description());
        product.setCategory(sample.category());
        product.setCondition(sample.condition());
        product.setCreditValue(sample.credits());
        product.setListingBonus(sample.credits() * 40 / 100);
        product.setStreet("12 Sample Street");
        product.setCity(sample.city());
        product.setState(sample.state());
        product.setPostalCode("560001");
        product.setCountry("India");
        product.setStatus(ProductStatus.ACTIVE);

        ProductMedia media = new ProductMedia();
        media.setProduct(product);
        media.setMediaUrl("/samples/" + sample.image() + ".svg");
        media.setMediaType(MediaType.IMAGE);
        media.setPrimary(true);
        product.getMedia().add(media);

        Product saved = productRepository.save(product);
        creditLedger.apply(seller.getId(), saved.getListingBonus(), CreditHistoryType.PRODUCT_APPROVED,
                "Listing reward (40%): " + saved.getTitle(), null);
    }
}
