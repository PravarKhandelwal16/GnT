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
        @Size(max = 5000, message = "Description cannot exceed 5000 characters")
        String description,

        @NotNull(message = "Category is required")
        Category category,

        @NotNull(message = "Condition is required")
        Condition condition,

        @NotNull(message = "Credit value is required")
        @Min(value = 1, message = "Credit value must be at least 1")
        Integer creditValue,

        @NotBlank(message = "Street address is required")
        @Size(max = 255, message = "Street address cannot exceed 255 characters")
        String street,

        @NotBlank(message = "City is required")
        @Size(max = 100, message = "City cannot exceed 100 characters")
        String city,

        @NotBlank(message = "State is required")
        @Size(max = 100, message = "State cannot exceed 100 characters")
        String state,

        @NotBlank(message = "Postal code is required")
        @Size(max = 20, message = "Postal code cannot exceed 20 characters")
        String postalCode,

        @NotBlank(message = "Country is required")
        @Size(max = 100, message = "Country cannot exceed 100 characters")
        String country
) {}
