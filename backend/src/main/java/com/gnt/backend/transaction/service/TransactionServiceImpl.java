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
import com.gnt.backend.transaction.dto.TransactionInitiateRequest;
import com.gnt.backend.transaction.dto.TransactionResponse;
import com.gnt.backend.transaction.mapper.TransactionMapper;
import com.gnt.backend.transaction.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CreditHistoryRepository creditHistoryRepository;
    private final TransactionMapper transactionMapper;

    public TransactionServiceImpl(
            TransactionRepository transactionRepository,
            ProductRepository productRepository,
            UserRepository userRepository,
            CreditHistoryRepository creditHistoryRepository,
            TransactionMapper transactionMapper) {
        this.transactionRepository = transactionRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.creditHistoryRepository = creditHistoryRepository;
        this.transactionMapper = transactionMapper;
    }

    @Override
    @Transactional
    public TransactionResponse initiateTransaction(TransactionInitiateRequest request, Long buyerId) {
        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (product.getStatus() != ProductStatus.ACTIVE) {
            throw new RuntimeException("Product is not available for exchange");
        }

        if (product.getOwner().getId().equals(buyerId)) {
            throw new RuntimeException("Cannot buy your own product");
        }

        boolean hasActiveTx = transactionRepository.existsByProductIdAndStatusIn(
                product.getId(), List.of(TransactionStatus.INITIATED, TransactionStatus.WAITING_CONFIRMATION));
        
        if (hasActiveTx) {
            throw new RuntimeException("Product is already currently engaged in a transaction");
        }

        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> new RuntimeException("Buyer not found"));

        int cost = product.getCreditValue();
        if (buyer.getCreditBalance() < cost) {
            throw new RuntimeException("Insufficient credits");
        }

        // Deduct buyer credits and hold in escrow
        buyer.setCreditBalance(buyer.getCreditBalance() - cost);
        userRepository.save(buyer);

        product.setStatus(ProductStatus.LOCKED);
        productRepository.save(product);

        Transaction transaction = new Transaction();
        transaction.setProduct(product);
        transaction.setSeller(product.getOwner());
        transaction.setBuyer(buyer);
        transaction.setCreditsUsed(cost);
        transaction.setQrToken(UUID.randomUUID().toString());
        transaction.setExpiresAt(LocalDateTime.now().plusMinutes(2));
        transaction.setStatus(TransactionStatus.INITIATED);
        
        Transaction saved = transactionRepository.save(transaction);

        CreditHistory escrowEntry = new CreditHistory();
        escrowEntry.setUser(buyer);
        escrowEntry.setTransaction(saved);
        escrowEntry.setAmount(-cost);
        escrowEntry.setTransactionType(CreditHistoryType.PRODUCT_PURCHASE);
        escrowEntry.setDescription("Escrow deduction for product: " + product.getTitle());
        creditHistoryRepository.save(escrowEntry);

        return transactionMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public TransactionResponse getTransactionById(Long transactionId, Long userId) {
        Transaction tx = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));
        
        if (!tx.getBuyer().getId().equals(userId) && !tx.getSeller().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        
        return transactionMapper.toResponse(tx);
    }

    @Override
    @Transactional
    public TransactionResponse buyerConfirm(String qrToken, Long buyerId) {
        Transaction tx = transactionRepository.findByQrToken(qrToken)
                .orElseThrow(() -> new RuntimeException("Invalid QR token"));

        if (!tx.getBuyer().getId().equals(buyerId)) {
            throw new RuntimeException("Unauthorized");
        }

        validateTransactionActive(tx);
        tx.setBuyerConfirmed(true);
        tx.setStatus(TransactionStatus.WAITING_CONFIRMATION);
        
        Transaction saved = transactionRepository.save(tx);
        checkAndComplete(saved);
        return transactionMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public TransactionResponse sellerConfirm(String qrToken, Long sellerId) {
        Transaction tx = transactionRepository.findByQrToken(qrToken)
                .orElseThrow(() -> new RuntimeException("Invalid QR token"));

        if (!tx.getSeller().getId().equals(sellerId)) {
            throw new RuntimeException("Unauthorized");
        }

        validateTransactionActive(tx);
        tx.setSellerConfirmed(true);
        tx.setStatus(TransactionStatus.WAITING_CONFIRMATION);
        
        Transaction saved = transactionRepository.save(tx);
        checkAndComplete(saved);
        return transactionMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public TransactionResponse cancelTransaction(Long transactionId, Long userId) {
        Transaction tx = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));
        
        if (!tx.getBuyer().getId().equals(userId) && !tx.getSeller().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        if (tx.getStatus() == TransactionStatus.COMPLETED || tx.getStatus() == TransactionStatus.CANCELLED || tx.getStatus() == TransactionStatus.EXPIRED) {
            throw new RuntimeException("Transaction already concluded");
        }

        // Refund buyer
        User buyer = tx.getBuyer();
        buyer.setCreditBalance(buyer.getCreditBalance() + tx.getCreditsUsed());
        userRepository.save(buyer);

        CreditHistory refund = new CreditHistory();
        refund.setUser(buyer);
        refund.setTransaction(tx);
        refund.setAmount(tx.getCreditsUsed());
        refund.setTransactionType(CreditHistoryType.REFUND);
        refund.setDescription("Refund for cancelled transaction: " + tx.getProduct().getTitle());
        creditHistoryRepository.save(refund);

        // Unlock product
        Product product = tx.getProduct();
        product.setStatus(ProductStatus.ACTIVE);
        productRepository.save(product);

        tx.setStatus(TransactionStatus.CANCELLED);
        tx.setCancelledAt(LocalDateTime.now());
        return transactionMapper.toResponse(transactionRepository.save(tx));
    }

    private void validateTransactionActive(Transaction tx) {
        if (tx.getStatus() == TransactionStatus.COMPLETED || tx.getStatus() == TransactionStatus.CANCELLED) {
            throw new RuntimeException("Transaction is no longer active");
        }
        if (tx.getExpiresAt().isBefore(LocalDateTime.now()) || tx.getStatus() == TransactionStatus.EXPIRED) {
            throw new RuntimeException("Transaction has expired");
        }
    }

    private void checkAndComplete(Transaction tx) {
        if (tx.isBuyerConfirmed() && tx.isSellerConfirmed()) {
            tx.setStatus(TransactionStatus.COMPLETED);
            tx.setCompletedAt(LocalDateTime.now());

            Product product = tx.getProduct();
            product.setStatus(ProductStatus.EXCHANGED);
            productRepository.save(product);

            // Give seller the remaining 50% credits (assuming total is creditValue)
            User seller = tx.getSeller();
            int remainingBonus = tx.getCreditsUsed() - (tx.getCreditsUsed() / 2);
            seller.setCreditBalance(seller.getCreditBalance() + remainingBonus);
            userRepository.save(seller);

            CreditHistory completeBonus = new CreditHistory();
            completeBonus.setUser(seller);
            completeBonus.setTransaction(tx);
            completeBonus.setAmount(remainingBonus);
            completeBonus.setTransactionType(CreditHistoryType.PRODUCT_COMPLETED);
            completeBonus.setDescription("Received final 50% credit value for completed exchange: " + product.getTitle());
            creditHistoryRepository.save(completeBonus);
        }
    }
}
