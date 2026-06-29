package com.gnt.backend.product.dto;

import com.gnt.backend.domain.enums.Category;
import com.gnt.backend.domain.enums.Condition;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record ProductRequest(
        @NotBlank(message = "Title is required")
        @Size(max = 255, message = "Title cannot exceed 255 characters")
        String title,

        @NotBlank(message = "Description is required")
        String description,

        @NotNull(message = "Category is required")
        Category category,

        @NotNull(message = "Condition is required")
        Condition condition,

        @NotNull(message = "Credit value is required")
        @Min(value = 1, message = "Credit value must be at least 1")
        Integer creditValue,

        @NotBlank(message = "Pickup address is required")
        @Size(max = 500, message = "Pickup address cannot exceed 500 characters")
        String pickupAddress,

        @NotNull(message = "Images are required")
        @Size(min = 1, message = "At least one image must be provided")
        @Valid
        List<ProductImageRequest> images
) {}
