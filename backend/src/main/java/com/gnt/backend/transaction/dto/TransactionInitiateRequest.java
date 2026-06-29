package com.gnt.backend.transaction.dto;

import jakarta.validation.constraints.NotNull;

public record TransactionInitiateRequest(
        @NotNull(message = "Product ID is required")
        Long productId
) {}
