package com.gnt.backend;

import com.gnt.backend.auth.repository.CreditHistoryRepository;
import com.gnt.backend.auth.repository.UserRepository;
import com.gnt.backend.domain.entity.Transaction;
import com.gnt.backend.domain.entity.User;
import com.gnt.backend.domain.enums.Category;
import com.gnt.backend.domain.enums.Condition;
import com.gnt.backend.domain.enums.CreditHistoryType;
import com.gnt.backend.domain.enums.ProductStatus;
import com.gnt.backend.domain.enums.TransactionStatus;
import com.gnt.backend.domain.enums.UserStatus;
import com.gnt.backend.exception.ApiException;
import com.gnt.backend.product.dto.ProductRequest;
import com.gnt.backend.product.dto.ProductResponse;
import com.gnt.backend.product.repository.ProductRepository;
import com.gnt.backend.product.service.ProductService;
import com.gnt.backend.transaction.dto.TransactionInitiateRequest;
import com.gnt.backend.transaction.dto.TransactionResponse;
import com.gnt.backend.transaction.repository.TransactionRepository;
import com.gnt.backend.transaction.service.TransactionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@ActiveProfiles("test")
class ExchangeFlowTests {

    private static final int START_BALANCE = 1000;

    @Autowired private ProductService productService;
    @Autowired private TransactionService transactionService;
    @Autowired private TransactionRepository transactionRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private CreditHistoryRepository creditHistoryRepository;

    private User seller;
    private User buyer;

    @BeforeEach
    void createUsers() {
        seller = newUser(START_BALANCE);
        buyer = newUser(START_BALANCE);
    }

    @Test
    void sellerEarnsExactlyTheItemValueEvenWhenItDoesNotDivideEvenly() {
        ProductResponse product = list(seller, 7);
        assertThat(balance(seller)).isEqualTo(START_BALANCE + 2);

        TransactionResponse tx = reserve(product, buyer);
        assertThat(balance(buyer)).isEqualTo(START_BALANCE - 7);

        transactionService.sellerConfirm(code(tx), seller.getId());
        TransactionResponse done = transactionService.buyerConfirm(code(tx), buyer.getId());

        assertThat(done.status()).isEqualTo(TransactionStatus.COMPLETED);
        assertThat(balance(seller)).isEqualTo(START_BALANCE + 7);
        assertThat(productStatus(product)).isEqualTo(ProductStatus.EXCHANGED);
    }

    @Test
    void onlyTheBuyerCanSeeTheHandoverCode() {
        TransactionResponse tx = reserve(list(seller, 100), buyer);

        assertThat(tx.qrToken()).isNotBlank();
        assertThat(transactionService.getTransactionById(tx.id(), seller.getId()).qrToken()).isNull();
    }

    @Test
    void reservationWindowAllowsTimeToMeet() {
        TransactionResponse tx = reserve(list(seller, 100), buyer);

        assertThat(tx.expiresAt()).isAfter(LocalDateTime.now().plusHours(47));
    }

    @Test
    void sellerCannotConfirmWithAWrongCode() {
        reserve(list(seller, 100), buyer);

        assertThatThrownBy(() -> transactionService.sellerConfirm("WRONGCODE", seller.getId()))
                .isInstanceOf(ApiException.class);
    }

    @Test
    void handoverCodeAcceptsTheFormattedVersionPeopleType() {
        TransactionResponse tx = reserve(list(seller, 100), buyer);
        String code = code(tx);
        String typed = (code.substring(0, 4) + "-" + code.substring(4)).toLowerCase();

        assertThat(transactionService.sellerConfirm(typed, seller.getId()).sellerConfirmed()).isTrue();
    }

    @Test
    void cancellingRefundsTheBuyerOnceAndRelistsTheItem() {
        ProductResponse product = list(seller, 100);
        TransactionResponse tx = reserve(product, buyer);

        transactionService.cancelTransaction(tx.id(), buyer.getId());

        assertThat(balance(buyer)).isEqualTo(START_BALANCE);
        assertThat(productStatus(product)).isEqualTo(ProductStatus.ACTIVE);
        assertThatThrownBy(() -> transactionService.cancelTransaction(tx.id(), buyer.getId()))
                .isInstanceOf(ApiException.class);
        assertThat(balance(buyer)).isEqualTo(START_BALANCE);
    }

    @Test
    void buyerCannotCancelAfterTheSellerConfirmedTheHandover() {
        TransactionResponse tx = reserve(list(seller, 100), buyer);
        transactionService.sellerConfirm(code(tx), seller.getId());

        assertThatThrownBy(() -> transactionService.cancelTransaction(tx.id(), buyer.getId()))
                .isInstanceOf(ApiException.class);
        assertThat(balance(buyer)).isEqualTo(START_BALANCE - 100);
    }

    @Test
    void anUnconfirmedExpiredReservationRefundsTheBuyer() {
        ProductResponse product = list(seller, 100);
        TransactionResponse tx = reserve(product, buyer);
        backdate(tx);

        transactionService.settleIfExpired(tx.id());
        transactionService.settleIfExpired(tx.id());

        assertThat(status(tx)).isEqualTo(TransactionStatus.EXPIRED);
        assertThat(balance(buyer)).isEqualTo(START_BALANCE);
        assertThat(productStatus(product)).isEqualTo(ProductStatus.ACTIVE);
    }

    @Test
    void anExpiredReservationCompletesIfTheHandoverWasConfirmed() {
        ProductResponse product = list(seller, 100);
        TransactionResponse tx = reserve(product, buyer);
        transactionService.sellerConfirm(code(tx), seller.getId());
        backdate(tx);

        transactionService.settleIfExpired(tx.id());

        assertThat(status(tx)).isEqualTo(TransactionStatus.COMPLETED);
        assertThat(balance(buyer)).isEqualTo(START_BALANCE - 100);
        assertThat(balance(seller)).isEqualTo(START_BALANCE + 100);
    }

    @Test
    void anUnexpiredReservationIsLeftAlone() {
        TransactionResponse tx = reserve(list(seller, 100), buyer);

        transactionService.settleIfExpired(tx.id());

        assertThat(status(tx)).isEqualTo(TransactionStatus.INITIATED);
    }

    @Test
    void repricingKeepsTheRewardAtFortyPercentAndDeletionReversesExactlyThat() {
        ProductResponse product = list(seller, 100);
        assertThat(balance(seller)).isEqualTo(START_BALANCE + 40);

        productService.updateProduct(product.id(), request(500), null, seller.getId());
        assertThat(balance(seller)).isEqualTo(START_BALANCE + 200);

        productService.deleteProduct(product.id(), seller.getId());
        assertThat(balance(seller)).isEqualTo(START_BALANCE);
        assertThat(productStatus(product)).isEqualTo(ProductStatus.DELETED);
    }

    @Test
    void completionUsesTheRepricedReward() {
        ProductResponse product = list(seller, 100);
        productService.updateProduct(product.id(), request(250), null, seller.getId());
        TransactionResponse tx = reserve(productService.getProductById(product.id(), seller.getId()), buyer);

        transactionService.sellerConfirm(code(tx), seller.getId());
        transactionService.buyerConfirm(code(tx), buyer.getId());

        assertThat(balance(seller)).isEqualTo(START_BALANCE + 250);
    }

    @Test
    void aListingCannotBeRemovedOnceItsRewardIsSpent() {
        User lowBalance = newUser(0);
        ProductResponse listed = list(lowBalance, 100);
        ProductResponse other = list(seller, 40);
        reserve(other, lowBalance);

        assertThatThrownBy(() -> productService.deleteProduct(listed.id(), lowBalance.getId()))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("40 credits");
        assertThat(balance(lowBalance)).isZero();
        assertThat(productStatus(listed)).isEqualTo(ProductStatus.ACTIVE);
    }

    @Test
    void listingValueIsCapped() {
        assertThatThrownBy(() -> list(seller, 1_000_000)).isInstanceOf(ApiException.class);
        assertThat(balance(seller)).isEqualTo(START_BALANCE);
    }

    @Test
    void aBuyerCannotReserveWithoutEnoughCredits() {
        User poorBuyer = newUser(10);
        ProductResponse product = list(seller, 100);

        assertThatThrownBy(() -> reserve(product, poorBuyer)).isInstanceOf(ApiException.class);

        assertThat(balance(poorBuyer)).isEqualTo(10);
        assertThat(productStatus(product)).isEqualTo(ProductStatus.ACTIVE);
    }

    @Test
    void concurrentReservationsOnlyChargeOneBuyer() throws Exception {
        ProductResponse product = list(seller, 100);
        List<User> buyers = List.of(newUser(500), newUser(500), newUser(500), newUser(500));

        CountDownLatch start = new CountDownLatch(1);
        ExecutorService pool = Executors.newFixedThreadPool(buyers.size());
        List<Future<Boolean>> results = buyers.stream()
                .map(b -> pool.submit((Callable<Boolean>) () -> {
                    start.await();
                    try {
                        reserve(product, b);
                        return true;
                    } catch (RuntimeException expected) {
                        return false;
                    }
                }))
                .toList();
        start.countDown();

        int winners = 0;
        for (Future<Boolean> result : results) {
            if (result.get()) {
                winners++;
            }
        }
        pool.shutdown();

        assertThat(winners).isEqualTo(1);
        int charged = buyers.stream().mapToInt(this::balance).map(b -> 500 - b).sum();
        assertThat(charged).isEqualTo(100);
    }

    @Test
    void concurrentCancelsOnlyRefundOnce() throws Exception {
        TransactionResponse tx = reserve(list(seller, 100), buyer);

        CountDownLatch start = new CountDownLatch(1);
        ExecutorService pool = Executors.newFixedThreadPool(2);
        Callable<Void> cancel = () -> {
            start.await();
            try {
                transactionService.cancelTransaction(tx.id(), buyer.getId());
            } catch (RuntimeException expected) {
                // the loser of the race
            }
            return null;
        };
        Future<Void> first = pool.submit(cancel);
        Future<Void> second = pool.submit(cancel);
        start.countDown();
        first.get();
        second.get();
        pool.shutdown();

        assertThat(balance(buyer)).isEqualTo(START_BALANCE);
    }

    @Test
    void ledgerAlwaysMatchesTheBalance() {
        TransactionResponse tx = reserve(list(seller, 300), buyer);
        transactionService.sellerConfirm(code(tx), seller.getId());
        transactionService.buyerConfirm(code(tx), buyer.getId());

        for (User user : List.of(seller, buyer)) {
            int ledgerTotal = creditHistoryRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), PageRequest.of(0, 50))
                    .stream().mapToInt(entry -> entry.getAmount()).sum();
            assertThat(START_BALANCE + ledgerTotal).isEqualTo(balance(user));
        }
        assertThat(creditHistoryRepository.findByUserIdOrderByCreatedAtDesc(seller.getId(), PageRequest.of(0, 50))
                .stream().map(entry -> entry.getTransactionType()))
                .contains(CreditHistoryType.PRODUCT_APPROVED, CreditHistoryType.PRODUCT_COMPLETED);
    }

    private TransactionResponse reserve(ProductResponse product, User who) {
        return transactionService.initiateTransaction(new TransactionInitiateRequest(product.id()), who.getId());
    }

    private String code(TransactionResponse tx) {
        return transactionRepository.findById(tx.id()).orElseThrow().getQrToken();
    }

    private void backdate(TransactionResponse tx) {
        Transaction entity = transactionRepository.findById(tx.id()).orElseThrow();
        entity.setExpiresAt(LocalDateTime.now().minusMinutes(1));
        transactionRepository.save(entity);
    }

    private TransactionStatus status(TransactionResponse tx) {
        return transactionRepository.findById(tx.id()).orElseThrow().getStatus();
    }

    private ProductStatus productStatus(ProductResponse product) {
        return productRepository.findById(product.id()).orElseThrow().getStatus();
    }

    private int balance(User user) {
        return userRepository.findById(user.getId()).orElseThrow().getCreditBalance();
    }

    private ProductResponse list(User owner, int value) {
        List<MultipartFile> files = List.of(
                new MockMultipartFile("files", "item.png", "image/png", new byte[]{1, 2, 3}));
        return productService.createProduct(request(value), files, owner.getId());
    }

    private ProductRequest request(int value) {
        return new ProductRequest("Test item", "A description", Category.BOOKS, Condition.GOOD, value,
                "1 Test Street", "Pune", "Maharashtra", "411001", "India");
    }

    private User newUser(int balance) {
        String unique = UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        User user = new User();
        user.setName("Test " + unique);
        user.setEmail(unique + "@example.test");
        user.setPhone(unique);
        user.setPassword("not-a-real-hash");
        user.setDateOfBirth(LocalDate.of(1990, 1, 1));
        user.setCreditBalance(balance);
        user.setStatus(UserStatus.ACTIVE);
        return userRepository.save(user);
    }
}
