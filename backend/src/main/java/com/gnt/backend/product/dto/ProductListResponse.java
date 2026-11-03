package com.gnt.backend.product.dto;

import com.gnt.backend.domain.enums.Category;
import com.gnt.backend.domain.enums.Condition;
import com.gnt.backend.domain.enums.ProductStatus;

import java.time.LocalDateTime;

public record ProductListResponse(
        Long id,
        String title,
        Category category,
        Condition condition,
        Integer creditValue,
        String primaryMediaUrl,
        String city,
        String state,
        LocalDateTime createdAt,
        ProductStatus status
) {}
