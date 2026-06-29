package com.gnt.backend.product.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ProductImageRequest(
        @NotBlank(message = "Image URL is required")
        String imageUrl,

        @NotNull(message = "isPrimary flag is required")
        Boolean isPrimary,

        @NotNull(message = "Display order is required")
        Integer displayOrder
) {}
