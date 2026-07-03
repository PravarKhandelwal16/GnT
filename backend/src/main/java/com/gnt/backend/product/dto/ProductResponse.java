package com.gnt.backend.product.dto;

import com.gnt.backend.domain.enums.Category;
import com.gnt.backend.domain.enums.Condition;
import com.gnt.backend.domain.enums.ProductStatus;

import java.time.LocalDateTime;
import java.util.List;

public record ProductResponse(
        Long id,
        Long ownerId,
        String ownerName,
        String title,
        String description,
        Category category,
        Condition condition,
        Integer creditValue,
        String street,
        String city,
        String state,
        String postalCode,
        String country,
        String sellerPhone,
        ProductStatus status,
        List<ProductMediaResponse> media,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
