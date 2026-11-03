package com.gnt.backend.admin;

import com.gnt.backend.admin.AdminDtos.*;
import com.gnt.backend.auth.repository.CreditHistoryRepository;
import com.gnt.backend.auth.repository.UserRepository;
import com.gnt.backend.credit.CreditLedger;
import com.gnt.backend.domain.entity.CreditHistory;
import com.gnt.backend.domain.entity.Product;
import com.gnt.backend.domain.entity.ProductMedia;
import com.gnt.backend.domain.entity.Report;
import com.gnt.backend.domain.entity.StaffAuditLog;
import com.gnt.backend.domain.entity.Transaction;
import com.gnt.backend.domain.entity.User;
import com.gnt.backend.domain.enums.CreditHistoryType;
import com.gnt.backend.domain.enums.ProductStatus;
import com.gnt.backend.domain.enums.ReportStatus;
import com.gnt.backend.domain.enums.Role;
import com.gnt.backend.domain.enums.TransactionStatus;
import com.gnt.backend.domain.enums.UserStatus;
import com.gnt.backend.exception.ApiException;
import com.gnt.backend.product.repository.ProductRepository;
import com.gnt.backend.report.repository.ReportRepository;
import com.gnt.backend.transaction.repository.TransactionRepository;
import com.gnt.backend.transaction.service.TransactionServiceImpl;
import jakarta.persistence.EntityManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.EnumSet;
import java.util.List;
import java.util.Locale;

/**
 * Staff operations. Every change is written to {@code staff_audit_log} in the same database
 * transaction, so an action and its audit record either both exist or neither does.
 */
@Service
public class AdminService {

    private final AdminRepository adminRepository;
    private final StaffAuditLogRepository auditRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final TransactionRepository transactionRepository;
    private final ReportRepository reportRepository;
    private final CreditHistoryRepository creditHistoryRepository;
    private final CreditLedger creditLedger;
    private final EntityManager entityManager;

    public AdminService(AdminRepository adminRepository,
                        StaffAuditLogRepository auditRepository,
                        UserRepository userRepository,
                        ProductRepository productRepository,
                        TransactionRepository transactionRepository,
                        ReportRepository reportRepository,
                        CreditHistoryRepository creditHistoryRepository,
                        CreditLedger creditLedger,
                        EntityManager entityManager) {
        this.adminRepository = adminRepository;
        this.auditRepository = auditRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.transactionRepository = transactionRepository;
        this.reportRepository = reportRepository;
        this.creditHistoryRepository = creditHistoryRepository;
        this.creditLedger = creditLedger;
        this.entityManager = entityManager;
    }

    // ── Overview ─────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Overview overview() {
        LocalDateTime now = LocalDateTime.now();
        return new Overview(
                adminRepository.countMembers(),
                adminRepository.countUsersByStatus(UserStatus.ACTIVE),
                adminRepository.countUsersByStatus(UserStatus.SUSPENDED),
                adminRepository.countUsersSince(now.minusDays(7)),
                adminRepository.countProductsByStatus(List.of(ProductStatus.ACTIVE)),
                adminRepository.countProductsByStatus(List.of(ProductStatus.LOCKED)),
                adminRepository.countProductsByStatus(List.of(ProductStatus.EXCHANGED)),
                adminRepository.countProductsByStatus(List.of(ProductStatus.REJECTED)),
                adminRepository.countTransactionsByStatus(TransactionServiceImpl.OPEN_STATUSES),
                adminRepository.countTransactionsByStatus(List.of(TransactionStatus.COMPLETED)),
                adminRepository.countTransactionsByStatus(List.of(TransactionStatus.CANCELLED, TransactionStatus.EXPIRED)),
                adminRepository.sumCreditsInWallets(),
                adminRepository.sumCreditsInTransactions(TransactionServiceImpl.OPEN_STATUSES),
                adminRepository.sumCreditsExchangedSince(now.minusDays(30)),
                adminRepository.countReportsByStatus(ReportStatus.OPEN));
    }

    // ── Members ──────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<UserRow> users(String query, UserStatus status, Role role, Pageable pageable) {
        return adminRepository.searchUsers(toPattern(query), status, role, pageable).map(this::toUserRow);
    }

    @Transactional(readOnly = true)
    public UserRow user(Long id) {
        return toUserRow(requireUser(id));
    }

    @Transactional(readOnly = true)
    public Page<CreditHistory> credits(Long userId, Pageable pageable) {
        requireUser(userId);
        return creditHistoryRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }

    @Transactional
    public UserRow suspend(Long actorId, Long userId, String reason) {
        User actor = requireUser(actorId);
        User user = requireUser(userId);
        if (actorId.equals(userId)) {
            throw ApiException.badRequest("You can't suspend yourself");
        }
        if (user.getRole().isStaff() && actor.getRole() != Role.ADMIN) {
            throw ApiException.forbidden("Only an owner can suspend a team member");
        }
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw ApiException.conflict("Only active members can be suspended");
        }
        user.setStatus(UserStatus.SUSPENDED);
        audit(actor, "USER_SUSPENDED", "USER", userId, reason);
        return toUserRow(user);
    }

    @Transactional
    public UserRow reactivate(Long actorId, Long userId, String reason) {
        User actor = requireUser(actorId);
        User user = requireUser(userId);
        if (user.getStatus() != UserStatus.SUSPENDED) {
            throw ApiException.conflict("Only suspended members can be reactivated");
        }
        user.setStatus(UserStatus.ACTIVE);
        audit(actor, "USER_REACTIVATED", "USER", userId, reason);
        return toUserRow(user);
    }

    @Transactional
    public UserRow adjustCredits(Long actorId, Long userId, int amount, String reason) {
        User actor = requireUser(actorId);
        User user = requireUser(userId);
        if (amount == 0) {
            throw ApiException.badRequest("Enter an amount other than zero");
        }
        if (user.getStatus() == UserStatus.DELETED) {
            throw ApiException.conflict("This account has been deleted");
        }
        creditLedger.apply(userId, amount, CreditHistoryType.MANUAL_ADJUSTMENT,
                "Adjustment by Give & Take: " + reason, null,
                "This member only has " + user.getCreditBalance() + " credits");
        audit(actor, "CREDITS_ADJUSTED", "USER", userId, (amount > 0 ? "+" : "") + amount + " · " + reason);
        // The balance was changed by a direct UPDATE, so reload the entity before reporting it.
        entityManager.refresh(user);
        return toUserRow(user);
    }

    @Transactional
    public UserRow changeRole(Long actorId, Long userId, Role role, String reason) {
        User actor = requireUser(actorId);
        User user = requireUser(userId);
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw ApiException.conflict("Only active members can be given a role");
        }
        if (user.getRole() == role) {
            return toUserRow(user);
        }
        if (user.getRole() == Role.ADMIN && adminRepository.countActiveAdmins() <= 1) {
            throw ApiException.conflict("There must always be at least one owner");
        }
        Role previous = user.getRole();
        user.setRole(role);
        audit(actor, "ROLE_CHANGED", "USER", userId, previous + " → " + role + " · " + reason);
        return toUserRow(user);
    }

    // ── Listings ─────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<ListingRow> listings(String query, ProductStatus status, Long ownerId, Pageable pageable) {
        return adminRepository.searchProducts(toPattern(query), status, ownerId, pageable).map(this::toListingRow);
    }

    @Transactional
    public ListingRow takeDown(Long actorId, Long productId, String reason) {
        User actor = requireUser(actorId);
        Product product = takeDownInternal(actor, productId, reason);
        return toListingRow(product);
    }

    @Transactional
    public ListingRow restore(Long actorId, Long productId, String reason) {
        User actor = requireUser(actorId);
        Product product = requireProduct(productId);
        if (product.getStatus() != ProductStatus.REJECTED) {
            throw ApiException.conflict("Only removed listings can be restored");
        }
        if (product.getOwner().getStatus() != UserStatus.ACTIVE) {
            throw ApiException.conflict("The owner's account isn't active");
        }

        // Pay back whatever was reversed at take-down, so the owner is at 40% again.
        int target = product.getCreditValue() * 40 / 100;
        int owed = target - product.getListingBonus();
        creditLedger.apply(product.getOwner().getId(), owed, CreditHistoryType.LISTING_ADJUSTMENT,
                "Listing reward restored: " + product.getTitle(), null);
        product.setListingBonus(target);
        product.setStatus(ProductStatus.ACTIVE);
        audit(actor, "LISTING_RESTORED", "LISTING", productId, reason);
        return toListingRow(product);
    }

    // ── Reports ──────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<ReportRow> reports(ReportStatus status, Pageable pageable) {
        return adminRepository.searchReports(status, pageable).map(this::toReportRow);
    }

    @Transactional
    public ReportRow resolveReport(Long actorId, Long reportId, ReportOutcome outcome, String note) {
        User actor = requireUser(actorId);
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> ApiException.notFound("Report not found"));
        if (report.getStatus() != ReportStatus.OPEN) {
            throw ApiException.conflict("This report has already been closed");
        }

        if (outcome == ReportOutcome.TAKE_DOWN && report.getProduct().getStatus() != ProductStatus.REJECTED) {
            takeDownInternal(actor, report.getProduct().getId(), "Report #" + reportId + ": " + note);
        }

        report.setStatus(ReportStatus.CLOSED);
        report.setResolutionNote((outcome == ReportOutcome.TAKE_DOWN ? "Removed listing. " : "Dismissed. ") + note);
        report.setResolvedBy(actor);
        report.setResolvedAt(LocalDateTime.now());
        audit(actor, "REPORT_" + outcome.name(), "REPORT", reportId, note);
        return toReportRow(report);
    }

    // ── Exchanges ────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<ExchangeRow> exchanges(TransactionStatus status, Long userId, Pageable pageable) {
        return adminRepository.searchTransactions(status, userId, pageable).map(this::toExchangeRow);
    }

    /** Dispute resolution: refunds the buyer even after a confirmation. */
    @Transactional
    public ExchangeRow cancelExchange(Long actorId, Long transactionId, String reason) {
        User actor = requireUser(actorId);
        Transaction tx = transactionRepository.findByIdForUpdate(transactionId)
                .orElseThrow(() -> ApiException.notFound("Exchange not found"));
        if (!TransactionServiceImpl.OPEN_STATUSES.contains(tx.getStatus())) {
            throw ApiException.conflict("Only open exchanges can be cancelled");
        }

        tx.setStatus(TransactionStatus.CANCELLED);
        tx.setCancelledAt(LocalDateTime.now());
        Product product = tx.getProduct();
        if (product.getStatus() == ProductStatus.LOCKED) {
            product.setStatus(product.getOwner().getStatus() == UserStatus.ACTIVE ? ProductStatus.ACTIVE : ProductStatus.REJECTED);
        }
        creditLedger.apply(tx.getBuyer().getId(), tx.getCreditsUsed(), CreditHistoryType.REFUND,
                "Refund after review by Give & Take: " + product.getTitle(), tx);
        audit(actor, "EXCHANGE_CANCELLED", "EXCHANGE", transactionId, reason);
        return toExchangeRow(tx);
    }

    // ── Audit ────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<AuditRow> audit(Long actorId, String targetType, Long targetId, Pageable pageable) {
        return adminRepository.searchAudit(actorId, targetType, targetId, pageable)
                .map(a -> new AuditRow(a.getId(), a.getActor().getId(), a.getActor().getName(), a.getAction(),
                        a.getTargetType(), a.getTargetId(), a.getDetails(), a.getCreatedAt()));
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private Product takeDownInternal(User actor, Long productId, String reason) {
        Product product = requireProduct(productId);
        if (product.getStatus() == ProductStatus.LOCKED) {
            throw ApiException.conflict("This item is in an open exchange. Cancel the exchange first.");
        }
        if (!EnumSet.of(ProductStatus.ACTIVE, ProductStatus.PENDING_AI_REVIEW, ProductStatus.DRAFT).contains(product.getStatus())) {
            throw ApiException.conflict("Only live listings can be removed");
        }

        // Reverse as much of the listing reward as the owner still holds; the rest may already be spent.
        User owner = userRepository.findById(product.getOwner().getId()).orElseThrow();
        int reversed = Math.min(product.getListingBonus(), owner.getCreditBalance());
        creditLedger.apply(owner.getId(), -reversed, CreditHistoryType.LISTING_ADJUSTMENT,
                "Listing reward reversed after removal by Give & Take: " + product.getTitle(), null);
        product.setListingBonus(product.getListingBonus() - reversed);
        product.setStatus(ProductStatus.REJECTED);

        String outstanding = product.getListingBonus() > 0
                ? " · " + product.getListingBonus() + " credits could not be reversed (already spent)"
                : "";
        audit(actor, "LISTING_REMOVED", "LISTING", productId, reason + " · reversed " + reversed + outstanding);
        return product;
    }

    private void audit(User actor, String action, String targetType, Long targetId, String details) {
        StaffAuditLog entry = new StaffAuditLog();
        entry.setActor(actor);
        entry.setAction(action);
        entry.setTargetType(targetType);
        entry.setTargetId(targetId);
        entry.setDetails(details.length() > 1000 ? details.substring(0, 1000) : details);
        auditRepository.save(entry);
    }

    private User requireUser(Long id) {
        return userRepository.findById(id).orElseThrow(() -> ApiException.notFound("Member not found"));
    }

    private Product requireProduct(Long id) {
        return productRepository.findById(id).orElseThrow(() -> ApiException.notFound("Listing not found"));
    }

    private static String toPattern(String query) {
        if (query == null || query.isBlank()) {
            return null;
        }
        String escaped = query.trim().toLowerCase(Locale.ROOT)
                .replace("!", "!!").replace("%", "!%").replace("_", "!_");
        return "%" + escaped + "%";
    }

    private UserRow toUserRow(User u) {
        return new UserRow(u.getId(), u.getName(), u.getEmail(), u.getPhone(), u.getRole(), u.getStatus(),
                u.getCreditBalance(), u.getRating(), u.getCity(), u.getCreatedAt());
    }

    private ListingRow toListingRow(Product p) {
        String image = p.getMedia().stream().filter(ProductMedia::isPrimary)
                .map(ProductMedia::getMediaUrl).findFirst().orElse(null);
        return new ListingRow(p.getId(), p.getTitle(), p.getOwner().getId(), p.getOwner().getName(), p.getStatus(),
                p.getCreditValue(), p.getListingBonus(), p.getCity(), image,
                adminRepository.countOpenReportsForProduct(p.getId()), p.getCreatedAt());
    }

    private ExchangeRow toExchangeRow(Transaction t) {
        return new ExchangeRow(t.getId(), t.getProduct().getId(), t.getProduct().getTitle(),
                t.getBuyer().getId(), t.getBuyer().getName(), t.getBuyer().getPhone(),
                t.getSeller().getId(), t.getSeller().getName(), t.getSeller().getPhone(),
                t.getCreditsUsed(), t.getStatus(), t.isBuyerConfirmed(), t.isSellerConfirmed(),
                t.getExpiresAt(), t.getCreatedAt(), t.getCompletedAt(), t.getCancelledAt());
    }

    private ReportRow toReportRow(Report r) {
        Product p = r.getProduct();
        return new ReportRow(r.getId(), p.getId(), p.getTitle(), p.getStatus(), p.getOwner().getId(),
                p.getOwner().getName(), r.getReporter().getId(), r.getReporter().getName(), r.getReason(),
                r.getDescription(), r.getStatus(), r.getResolutionNote(),
                r.getResolvedBy() != null ? r.getResolvedBy().getName() : null, r.getCreatedAt(), r.getResolvedAt());
    }
}
