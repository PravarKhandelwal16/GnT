package com.gnt.backend.transaction.repository;

import com.gnt.backend.domain.entity.Transaction;
import com.gnt.backend.domain.enums.TransactionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    
    Optional<Transaction> findByQrToken(String qrToken);

    @Query("SELECT t FROM Transaction t WHERE t.expiresAt < :now AND t.status IN :statuses")
    List<Transaction> findExpiredTransactions(
            @Param("now") LocalDateTime now,
            @Param("statuses") List<TransactionStatus> statuses);
            
    // Prevent duplicate active transactions for a product
    boolean existsByProductIdAndStatusIn(Long productId, List<TransactionStatus> statuses);
}
