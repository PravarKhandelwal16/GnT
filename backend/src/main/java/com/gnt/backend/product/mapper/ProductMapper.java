package com.gnt.backend.product.mapper;

import com.gnt.backend.domain.entity.Product;
import com.gnt.backend.domain.entity.ProductMedia;
import com.gnt.backend.product.dto.ProductMediaResponse;
import com.gnt.backend.product.dto.ProductListResponse;
import com.gnt.backend.product.dto.ProductResponse;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ProductMapper {

    public ProductResponse toResponse(Product product) {
        List<ProductMediaResponse> mediaResponses = product.getMedia().stream()
                .map(this::toMediaResponse)
                .collect(Collectors.toList());

        return new ProductResponse(
                product.getId(),
                product.getOwner().getId(),
                product.getOwner().getName(),
                product.getTitle(),
                product.getDescription(),
                product.getCategory(),
                product.getCondition(),
                product.getCreditValue(),
                product.getPickupAddress(),
                product.getStatus(),
                mediaResponses,
                product.getCreatedAt(),
                product.getUpdatedAt()
        );
    }

    public ProductListResponse toListResponse(Product product) {
        String primaryMediaUrl = product.getMedia().stream()
                .filter(ProductMedia::isPrimary)
                .map(ProductMedia::getMediaUrl)
                .findFirst()
                .orElse(null);

        return new ProductListResponse(
                product.getId(),
                product.getTitle(),
                product.getCategory(),
                product.getCondition(),
                product.getCreditValue(),
                primaryMediaUrl,
                product.getCreatedAt()
        );
    }

    private ProductMediaResponse toMediaResponse(ProductMedia media) {
        return new ProductMediaResponse(
                media.getId(),
                media.getMediaUrl(),
                media.getMediaType(),
                media.isPrimary(),
                media.getDisplayOrder()
        );
    }
}
