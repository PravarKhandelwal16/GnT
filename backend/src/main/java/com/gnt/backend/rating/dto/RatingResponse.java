package com.gnt.backend.rating.dto;

import java.time.LocalDateTime;

public record RatingResponse(
        Long id,
        Long transactionId,
        Long reviewerId,
        String reviewerName,
        Long revieweeId,
        String revieweeName,
        Integer rating,
        String review,
        LocalDateTime createdAt
) {}
