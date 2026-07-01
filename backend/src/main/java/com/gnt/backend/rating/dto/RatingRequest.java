package com.gnt.backend.rating.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RatingRequest(
        @NotNull(message = "Transaction ID is required")
        Long transactionId,

        @NotNull(message = "Rating is required")
        @Min(value = 1, message = "Rating must be at least 1")
        @Max(value = 5, message = "Rating cannot be more than 5")
        Integer rating,

        @Size(max = 1000, message = "Review cannot exceed 1000 characters")
        String review
) {}
