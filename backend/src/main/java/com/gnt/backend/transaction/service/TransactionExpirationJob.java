package com.gnt.backend.transaction.service;

import com.gnt.backend.auth.repository.UserRepository;
import com.gnt.backend.domain.entity.CreditHistory;
import com.gnt.backend.domain.entity.Product;
import com.gnt.backend.domain.entity.Transaction;
import com.gnt.backend.domain.entity.User;
import com.gnt.backend.domain.enums.CreditHistoryType;
import com.gnt.backend.domain.enums.ProductStatus;
import com.gnt.backend.domain.enums.TransactionStatus;
import com.gnt.backend.auth.repository.CreditHistoryRepository;
import com.gnt.backend.product.repository.ProductRepository;
import com.gnt.backend.transaction.repository.TransactionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class TransactionExpirationJob {

    private static final Logger log = LoggerFactory.getLogger(TransactionExpirationJob.class);

    private final TransactionRepository transactionRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CreditHistoryRepository creditHistoryRepository;

    public TransactionExpirationJob(
            TransactionRepository transactionRepository,
            ProductRepository productRepository,
            UserRepository userRepository,
            CreditHistoryRepository creditHistoryRepository) {
        this.transactionRepository = transactionRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.creditHistoryRepository = creditHistoryRepository;
    }

    // Run every 30 seconds
    @Scheduled(cron = "*/30 * * * * *")
    @Transactional
    public void processExpiredTransactions() {
        LocalDateTime now = LocalDateTime.now();
        List<Transaction> expiredTransactions = transactionRepository.findExpiredTransactions(
                now, List.of(TransactionStatus.INITIATED, TransactionStatus.WAITING_CONFIRMATION)
        );

        if (!expiredTransactions.isEmpty()) {
            log.info("Found {} expired transactions. Processing refunds...", expiredTransactions.size());
            for (Transaction tx : expiredTransactions) {
                expireTransaction(tx);
            }
        }
    }

    private void expireTransaction(Transaction tx) {
        // Refund buyer
        User buyer = tx.getBuyer();
        buyer.setCreditBalance(buyer.getCreditBalance() + tx.getCreditsUsed());
        userRepository.save(buyer);

        CreditHistory refund = new CreditHistory();
        refund.setUser(buyer);
        refund.setTransaction(tx);
        refund.setAmount(tx.getCreditsUsed());
        refund.setTransactionType(CreditHistoryType.REFUND);
        refund.setDescription("Refund for expired transaction timeout: " + tx.getProduct().getTitle());
        creditHistoryRepository.save(refund);

        // Unlock product
        Product product = tx.getProduct();
        product.setStatus(ProductStatus.ACTIVE);
        productRepository.save(product);

        // Mark as EXPIRED
        tx.setStatus(TransactionStatus.EXPIRED);
        tx.setCancelledAt(LocalDateTime.now());
        transactionRepository.save(tx);
        
        log.info("Expired transaction ID {} successfully", tx.getId());
    }
}
