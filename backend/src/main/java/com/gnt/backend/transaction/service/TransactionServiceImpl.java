package com.gnt.backend.transaction.service;

import com.gnt.backend.auth.repository.UserRepository;
import com.gnt.backend.credit.CreditLedger;
import com.gnt.backend.domain.entity.Product;
import com.gnt.backend.domain.entity.Transaction;
import com.gnt.backend.domain.entity.User;
import com.gnt.backend.domain.enums.CreditHistoryType;
import com.gnt.backend.domain.enums.ProductStatus;
import com.gnt.backend.domain.enums.TransactionStatus;
import com.gnt.backend.domain.enums.UserStatus;
import com.gnt.backend.exception.ApiException;
import com.gnt.backend.product.repository.ProductRepository;
import com.gnt.backend.transaction.dto.TransactionInitiateRequest;
import com.gnt.backend.transaction.dto.TransactionResponse;
import com.gnt.backend.transaction.mapper.TransactionMapper;
import com.gnt.backend.transaction.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.EnumSet;
import java.util.Locale;
import java.util.Set;

/**
 * Exchange lifecycle.
 *
 * <p>Handover proof: only the buyer can see the code. The seller gets it by scanning the
 * buyer's QR code in person, so neither party can complete an exchange alone. The buyer
 * then confirms receipt. If the reservation window closes after either party confirmed,
 * the handover happened and the exchange completes rather than refunding the buyer.
 */
@Service
public class TransactionServiceImpl implements TransactionService {

    public static final Set<TransactionStatus> OPEN_STATUSES =
            EnumSet.of(TransactionStatus.INITIATED, TransactionStatus.WAITING_CONFIRMATION);

    // No 0/O/1/I/L/U: the code can be read out and typed by hand.
    private static final char[] CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTVWXYZ".toCharArray();
    private static final int CODE_LENGTH = 8;
    private static final String INVALID_CODE = "That code doesn't match this exchange";

    private final SecureRandom random = new SecureRandom();
    private final TransactionRepository transactionRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CreditLedger creditLedger;
    private final TransactionMapper transactionMapper;
    private final int reservationHours;

    public TransactionServiceImpl(
            TransactionRepository transactionRepository,
            ProductRepository productRepository,
            UserRepository userRepository,
            CreditLedger creditLedger,
            TransactionMapper transactionMapper,
            @Value("${application.exchange.reservation-hours}") int reservationHours) {
        this.transactionRepository = transactionRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.creditLedger = creditLedger;
        this.transactionMapper = transactionMapper;
        this.reservationHours = reservationHours;
    }

    @Override
    @Transactional
    public TransactionResponse initiateTransaction(TransactionInitiateRequest request, Long buyerId) {
        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> ApiException.notFound("Product not found"));

        if (product.getStatus() != ProductStatus.ACTIVE || product.getOwner().getStatus() != UserStatus.ACTIVE) {
            throw ApiException.conflict("This item is no longer available");
        }
        if (product.getOwner().getId().equals(buyerId)) {
            throw ApiException.badRequest("You can't reserve your own item");
        }
        if (transactionRepository.existsByProductIdAndStatusIn(product.getId(), OPEN_STATUSES)) {
            throw ApiException.conflict("This item has just been reserved");
        }

        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> ApiException.notFound("Buyer not found"));
        if (buyer.getStatus() != UserStatus.ACTIVE) {
            throw ApiException.forbidden("Your account can't reserve items");
        }

        // The product's @Version rejects a second concurrent reservation at commit,
        // which rolls back that buyer's deduction too.
        product.setStatus(ProductStatus.LOCKED);
        productRepository.save(product);

        Transaction transaction = new Transaction();
        transaction.setProduct(product);
        transaction.setSeller(product.getOwner());
        transaction.setBuyer(buyer);
        transaction.setCreditsUsed(product.getCreditValue());
        transaction.setQrToken(generateHandoverCode());
        transaction.setExpiresAt(LocalDateTime.now().plusHours(reservationHours));
        transaction.setStatus(TransactionStatus.INITIATED);
        Transaction saved = transactionRepository.save(transaction);

        creditLedger.apply(buyerId, -product.getCreditValue(), CreditHistoryType.PRODUCT_PURCHASE,
                "Credits held for reservation: " + product.getTitle(), saved,
                "You don't have enough credits for this item");

        return transactionMapper.toResponse(saved, buyerId);
    }

    @Override
    @Transactional(readOnly = true)
    public TransactionResponse getTransactionById(Long transactionId, Long userId) {
        Transaction tx = transactionRepository.findById(transactionId)
                .orElseThrow(() -> ApiException.notFound("Exchange not found"));
        requireParticipant(tx, userId);
        return transactionMapper.toResponse(tx, userId);
    }

    @Override
    @Transactional
    public TransactionResponse buyerConfirm(String qrToken, Long buyerId) {
        Transaction tx = findByCode(qrToken);
        if (!tx.getBuyer().getId().equals(buyerId)) {
            throw ApiException.badRequest(INVALID_CODE);
        }
        requireOpenAndInTime(tx);

        tx.setBuyerConfirmed(true);
        tx.setStatus(TransactionStatus.WAITING_CONFIRMATION);
        completeIfBothConfirmed(tx);
        return transactionMapper.toResponse(tx, buyerId);
    }

    @Override
    @Transactional
    public TransactionResponse sellerConfirm(String qrToken, Long sellerId) {
        Transaction tx = findByCode(qrToken);
        if (!tx.getSeller().getId().equals(sellerId)) {
            throw ApiException.badRequest(INVALID_CODE);
        }
        requireOpenAndInTime(tx);

        tx.setSellerConfirmed(true);
        tx.setStatus(TransactionStatus.WAITING_CONFIRMATION);
        completeIfBothConfirmed(tx);
        return transactionMapper.toResponse(tx, sellerId);
    }

    @Override
    @Transactional
    public TransactionResponse cancelTransaction(Long transactionId, Long userId) {
        Transaction tx = transactionRepository.findByIdForUpdate(transactionId)
                .orElseThrow(() -> ApiException.notFound("Exchange not found"));
        requireParticipant(tx, userId);

        if (!OPEN_STATUSES.contains(tx.getStatus())) {
            throw ApiException.conflict("This exchange has already finished");
        }
        if (tx.isBuyerConfirmed() || tx.isSellerConfirmed()) {
            throw ApiException.conflict("This exchange can't be cancelled after the handover has been confirmed");
        }

        refundAndRelease(tx, TransactionStatus.CANCELLED,
                "Refund for cancelled exchange: " + tx.getProduct().getTitle());
        return transactionMapper.toResponse(tx, userId);
    }

    @Override
    @Transactional
    public void settleIfExpired(Long transactionId) {
        Transaction tx = transactionRepository.findByIdForUpdate(transactionId).orElse(null);
        if (tx == null || !OPEN_STATUSES.contains(tx.getStatus())
                || !tx.getExpiresAt().isBefore(LocalDateTime.now())) {
            return;
        }

        if (tx.isBuyerConfirmed() || tx.isSellerConfirmed()) {
            complete(tx);
        } else {
            refundAndRelease(tx, TransactionStatus.EXPIRED,
                    "Refund for expired reservation: " + tx.getProduct().getTitle());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TransactionResponse> getMyTransactions(Long userId, Pageable pageable) {
        return transactionRepository.findAllByUserId(userId, pageable)
                .map(tx -> transactionMapper.toResponse(tx, userId));
    }

    private Transaction findByCode(String rawCode) {
        // Scanned and typed codes may differ in case or include the display hyphen.
        String code = rawCode.trim().replace("-", "").toUpperCase(Locale.ROOT);
        return transactionRepository.findByQrTokenForUpdate(code)
                .orElseThrow(() -> ApiException.badRequest(INVALID_CODE));
    }

    private void requireParticipant(Transaction tx, Long userId) {
        if (!tx.getBuyer().getId().equals(userId) && !tx.getSeller().getId().equals(userId)) {
            // 404, not 403: don't reveal that the exchange exists.
            throw ApiException.notFound("Exchange not found");
        }
    }

    private void requireOpenAndInTime(Transaction tx) {
        if (!OPEN_STATUSES.contains(tx.getStatus())) {
            throw ApiException.conflict("This exchange has already finished");
        }
        if (tx.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw ApiException.conflict("This reservation has expired");
        }
    }

    private void completeIfBothConfirmed(Transaction tx) {
        if (tx.isBuyerConfirmed() && tx.isSellerConfirmed()) {
            complete(tx);
        }
    }

    private void complete(Transaction tx) {
        Product product = tx.getProduct();
        tx.setStatus(TransactionStatus.COMPLETED);
        tx.setCompletedAt(LocalDateTime.now());
        product.setStatus(ProductStatus.EXCHANGED);

        // Listing bonus + this payout always equals exactly what the buyer paid.
        int remaining = Math.max(0, tx.getCreditsUsed() - product.getListingBonus());
        creditLedger.apply(tx.getSeller().getId(), remaining, CreditHistoryType.PRODUCT_COMPLETED,
                "Final credits for completed exchange: " + product.getTitle(), tx);
    }

    private void refundAndRelease(Transaction tx, TransactionStatus finalStatus, String description) {
        tx.setStatus(finalStatus);
        tx.setCancelledAt(LocalDateTime.now());
        tx.getProduct().setStatus(ProductStatus.ACTIVE);
        creditLedger.apply(tx.getBuyer().getId(), tx.getCreditsUsed(), CreditHistoryType.REFUND, description, tx);
    }

    private String generateHandoverCode() {
        String code;
        do {
            StringBuilder builder = new StringBuilder(CODE_LENGTH);
            for (int i = 0; i < CODE_LENGTH; i++) {
                builder.append(CODE_ALPHABET[random.nextInt(CODE_ALPHABET.length)]);
            }
            code = builder.toString();
        } while (transactionRepository.existsByQrToken(code));
        return code;
    }
}
