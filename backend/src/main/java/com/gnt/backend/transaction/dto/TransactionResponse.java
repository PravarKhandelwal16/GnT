package com.gnt.backend.transaction.dto;

import com.gnt.backend.domain.enums.TransactionStatus;

import java.time.LocalDateTime;

public record TransactionResponse(
        Long id,
        Long productId,
        String productTitle,
        String productImageUrl,
        Long buyerId,
        String buyerName,
        Long sellerId,
        String sellerName,
        Integer creditsUsed,
        /* Handover code. Only the buyer ever receives it; the seller gets it from the buyer in person. */
        String qrToken,
        Boolean buyerConfirmed,
        Boolean sellerConfirmed,
        TransactionStatus status,
        /* Visible to the buyer while the exchange is open or complete. */
        String pickupAddress,
        /* The other party's number, only while the exchange is open. */
        String counterpartPhone,
        Boolean ratedByViewer,
        LocalDateTime expiresAt,
        LocalDateTime createdAt,
        LocalDateTime completedAt,
        LocalDateTime cancelledAt
) {}
