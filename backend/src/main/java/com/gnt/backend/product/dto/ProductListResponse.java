package com.gnt.backend.product.dto;

import com.gnt.backend.domain.enums.Category;
import com.gnt.backend.domain.enums.Condition;

import java.time.LocalDateTime;

public record ProductListResponse(
        Long id,
        String title,
        Category category,
        Condition condition,
        Integer creditValue,
        String primaryImageUrl,
        LocalDateTime createdAt
) {}
