package com.gnt.backend.product.dto;

public record ProductImageResponse(
        Long id,
        String imageUrl,
        Boolean isPrimary,
        Integer displayOrder
) {}
