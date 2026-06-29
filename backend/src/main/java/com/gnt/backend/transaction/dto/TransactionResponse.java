package com.gnt.backend.transaction.dto;

import com.gnt.backend.domain.enums.TransactionStatus;

import java.time.LocalDateTime;

public record TransactionResponse(
        Long id,
        Long productId,
        String productTitle,
        Long buyerId,
        String buyerName,
        Long sellerId,
        String sellerName,
        Integer creditsUsed,
        String qrToken,
        Boolean buyerConfirmed,
        Boolean sellerConfirmed,
        TransactionStatus status,
        LocalDateTime expiresAt,
        LocalDateTime createdAt,
        LocalDateTime completedAt,
        LocalDateTime cancelledAt
) {}
