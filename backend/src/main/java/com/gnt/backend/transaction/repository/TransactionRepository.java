package com.gnt.backend.transaction.repository;

import com.gnt.backend.domain.entity.Transaction;
import com.gnt.backend.domain.enums.TransactionStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    // State changes take a row lock so cancel, confirm and expiry cannot both settle one exchange.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT t FROM Transaction t WHERE t.id = :id")
    Optional<Transaction> findByIdForUpdate(@Param("id") Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT t FROM Transaction t WHERE t.qrToken = :qrToken")
    Optional<Transaction> findByQrTokenForUpdate(@Param("qrToken") String qrToken);

    boolean existsByQrToken(String qrToken);

    @Query("SELECT t.id FROM Transaction t WHERE t.expiresAt < :now AND t.status IN :statuses")
    List<Long> findExpiredTransactionIds(
            @Param("now") LocalDateTime now,
            @Param("statuses") Collection<TransactionStatus> statuses);

    // Prevent duplicate active transactions for a product
    boolean existsByProductIdAndStatusIn(Long productId, Collection<TransactionStatus> statuses);

    // Check if user is a buyer in specific statuses
    boolean existsByProductIdAndBuyerIdAndStatusIn(Long productId, Long buyerId, Collection<TransactionStatus> statuses);

    @Query("SELECT COUNT(t) > 0 FROM Transaction t " +
           "WHERE (t.buyer.id = :userId OR t.seller.id = :userId) AND t.status IN :statuses")
    boolean existsForUserInStatuses(@Param("userId") Long userId, @Param("statuses") Collection<TransactionStatus> statuses);

    // All transactions where the user is buyer or seller (for /me endpoint)
    @Query("SELECT t FROM Transaction t WHERE t.buyer.id = :userId OR t.seller.id = :userId ORDER BY t.createdAt DESC")
    Page<Transaction> findAllByUserId(@Param("userId") Long userId, Pageable pageable);
}
