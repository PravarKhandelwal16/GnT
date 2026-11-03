package com.gnt.backend.admin;

import com.gnt.backend.domain.enums.ProductStatus;
import com.gnt.backend.domain.enums.ReportStatus;
import com.gnt.backend.domain.enums.Role;
import com.gnt.backend.domain.enums.TransactionStatus;
import com.gnt.backend.domain.enums.UserStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** Request and response shapes for the staff API. */
public final class AdminDtos {

    private AdminDtos() {
    }

    public record Overview(
            long totalMembers,
            long activeMembers,
            long suspendedMembers,
            long newMembersLast7Days,
            long liveListings,
            long reservedListings,
            long exchangedListings,
            long removedListings,
            long openExchanges,
            long completedExchanges,
            long cancelledOrExpiredExchanges,
            long creditsInWallets,
            long creditsHeldInExchanges,
            long creditsExchangedLast30Days,
            long openReports
    ) {}

    public record UserRow(
            Long id,
            String name,
            String email,
            String phone,
            Role role,
            UserStatus status,
            Integer creditBalance,
            BigDecimal rating,
            String city,
            LocalDateTime createdAt
    ) {}

    public record ListingRow(
            Long id,
            String title,
            Long ownerId,
            String ownerName,
            ProductStatus status,
            Integer creditValue,
            Integer listingBonus,
            String city,
            String primaryMediaUrl,
            long openReports,
            LocalDateTime createdAt
    ) {}

    public record ExchangeRow(
            Long id,
            Long productId,
            String productTitle,
            Long buyerId,
            String buyerName,
            String buyerPhone,
            Long sellerId,
            String sellerName,
            String sellerPhone,
            Integer creditsUsed,
            TransactionStatus status,
            boolean buyerConfirmed,
            boolean sellerConfirmed,
            LocalDateTime expiresAt,
            LocalDateTime createdAt,
            LocalDateTime completedAt,
            LocalDateTime cancelledAt
    ) {}

    public record ReportRow(
            Long id,
            Long productId,
            String productTitle,
            ProductStatus productStatus,
            Long ownerId,
            String ownerName,
            Long reporterId,
            String reporterName,
            String reason,
            String description,
            ReportStatus status,
            String resolutionNote,
            String resolvedByName,
            LocalDateTime createdAt,
            LocalDateTime resolvedAt
    ) {}

    public record AuditRow(
            Long id,
            Long actorId,
            String actorName,
            String action,
            String targetType,
            Long targetId,
            String details,
            LocalDateTime createdAt
    ) {}

    public record ReasonRequest(
            @NotBlank(message = "Give a reason")
            @Size(max = 500, message = "Keep the reason under 500 characters")
            String reason
    ) {}

    public enum ReportOutcome { DISMISS, TAKE_DOWN }

    public record ResolveReportRequest(
            @NotNull(message = "Choose an outcome") ReportOutcome outcome,
            @NotBlank(message = "Add a note") @Size(max = 500, message = "Keep the note under 500 characters") String note
    ) {}

    public record CreditAdjustmentRequest(
            @NotNull(message = "Enter an amount")
            @Min(value = -100000, message = "Amount is too large")
            @Max(value = 100000, message = "Amount is too large")
            Integer amount,
            @NotBlank(message = "Give a reason") @Size(max = 500, message = "Keep the reason under 500 characters") String reason
    ) {}

    public record RoleRequest(
            @NotNull(message = "Choose a role") Role role,
            @NotBlank(message = "Give a reason") @Size(max = 500, message = "Keep the reason under 500 characters") String reason
    ) {}
}
