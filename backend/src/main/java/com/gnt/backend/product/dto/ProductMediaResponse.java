package com.gnt.backend.product.dto;

import com.gnt.backend.domain.enums.MediaType;

public record ProductMediaResponse(
        Long id,
        String mediaUrl,
        MediaType mediaType,
        boolean isPrimary,
        Integer displayOrder
) {
}
