package com.gnt.backend.admin;

import com.gnt.backend.domain.entity.Product;
import com.gnt.backend.domain.entity.Report;
import com.gnt.backend.domain.entity.StaffAuditLog;
import com.gnt.backend.domain.entity.Transaction;
import com.gnt.backend.domain.entity.User;
import com.gnt.backend.domain.enums.ProductStatus;
import com.gnt.backend.domain.enums.ReportStatus;
import com.gnt.backend.domain.enums.Role;
import com.gnt.backend.domain.enums.TransactionStatus;
import com.gnt.backend.domain.enums.UserStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Collection;

/** Read-only queries for the staff area. Writes go through the normal repositories. */
public interface AdminRepository extends Repository<User, Long> {

    // ── Overview ─────────────────────────────────────────────────────────────

    @Query("SELECT COUNT(u) FROM User u WHERE u.status <> com.gnt.backend.domain.enums.UserStatus.DELETED")
    long countMembers();

    @Query("SELECT COUNT(u) FROM User u WHERE u.status = :status")
    long countUsersByStatus(@Param("status") UserStatus status);

    @Query("SELECT COUNT(u) FROM User u WHERE u.createdAt >= :since AND u.status <> com.gnt.backend.domain.enums.UserStatus.DELETED")
    long countUsersSince(@Param("since") LocalDateTime since);

    @Query("SELECT COUNT(p) FROM Product p WHERE p.status IN :statuses")
    long countProductsByStatus(@Param("statuses") Collection<ProductStatus> statuses);

    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.status IN :statuses")
    long countTransactionsByStatus(@Param("statuses") Collection<TransactionStatus> statuses);

    @Query("SELECT COALESCE(SUM(u.creditBalance), 0) FROM User u WHERE u.status <> com.gnt.backend.domain.enums.UserStatus.DELETED")
    long sumCreditsInWallets();

    @Query("SELECT COALESCE(SUM(t.creditsUsed), 0) FROM Transaction t WHERE t.status IN :statuses")
    long sumCreditsInTransactions(@Param("statuses") Collection<TransactionStatus> statuses);

    @Query("SELECT COALESCE(SUM(t.creditsUsed), 0) FROM Transaction t " +
           "WHERE t.status = com.gnt.backend.domain.enums.TransactionStatus.COMPLETED AND t.completedAt >= :since")
    long sumCreditsExchangedSince(@Param("since") LocalDateTime since);

    @Query("SELECT COUNT(r) FROM Report r WHERE r.status = :status")
    long countReportsByStatus(@Param("status") ReportStatus status);

    // ── Lists ────────────────────────────────────────────────────────────────

    @Query("SELECT u FROM User u WHERE " +
           "(:status IS NULL OR u.status = :status) AND (:role IS NULL OR u.role = :role) AND " +
           "(:pattern IS NULL OR LOWER(u.name) LIKE :pattern ESCAPE '!' OR LOWER(u.email) LIKE :pattern ESCAPE '!' " +
           " OR u.phone LIKE :pattern ESCAPE '!') ORDER BY u.createdAt DESC")
    Page<User> searchUsers(@Param("pattern") String pattern, @Param("status") UserStatus status,
                           @Param("role") Role role, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE " +
           "(:status IS NULL OR p.status = :status) AND (:ownerId IS NULL OR p.owner.id = :ownerId) AND " +
           "(:pattern IS NULL OR LOWER(p.title) LIKE :pattern ESCAPE '!' OR LOWER(p.owner.name) LIKE :pattern ESCAPE '!') " +
           "ORDER BY p.createdAt DESC")
    Page<Product> searchProducts(@Param("pattern") String pattern, @Param("status") ProductStatus status,
                                 @Param("ownerId") Long ownerId, Pageable pageable);

    @Query("SELECT COUNT(r) FROM Report r WHERE r.product.id = :productId AND r.status = com.gnt.backend.domain.enums.ReportStatus.OPEN")
    long countOpenReportsForProduct(@Param("productId") Long productId);

    @Query("SELECT t FROM Transaction t WHERE " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:userId IS NULL OR t.buyer.id = :userId OR t.seller.id = :userId) ORDER BY t.createdAt DESC")
    Page<Transaction> searchTransactions(@Param("status") TransactionStatus status, @Param("userId") Long userId,
                                         Pageable pageable);

    @Query("SELECT r FROM Report r WHERE (:status IS NULL OR r.status = :status) ORDER BY r.createdAt DESC")
    Page<Report> searchReports(@Param("status") ReportStatus status, Pageable pageable);

    @Query("SELECT a FROM StaffAuditLog a WHERE (:actorId IS NULL OR a.actor.id = :actorId) " +
           "AND (:targetType IS NULL OR a.targetType = :targetType) AND (:targetId IS NULL OR a.targetId = :targetId) " +
           "ORDER BY a.createdAt DESC, a.id DESC")
    Page<StaffAuditLog> searchAudit(@Param("actorId") Long actorId, @Param("targetType") String targetType,
                                    @Param("targetId") Long targetId, Pageable pageable);

    @Query("SELECT COUNT(u) FROM User u WHERE u.role = com.gnt.backend.domain.enums.Role.ADMIN " +
           "AND u.status = com.gnt.backend.domain.enums.UserStatus.ACTIVE")
    long countActiveAdmins();
}
