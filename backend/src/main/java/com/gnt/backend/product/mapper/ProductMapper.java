package com.gnt.backend.product.mapper;

import com.gnt.backend.domain.entity.Product;
import com.gnt.backend.domain.entity.ProductImage;
import com.gnt.backend.product.dto.ProductImageResponse;
import com.gnt.backend.product.dto.ProductListResponse;
import com.gnt.backend.product.dto.ProductResponse;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ProductMapper {

    public ProductResponse toResponse(Product product) {
        List<ProductImageResponse> imageResponses = product.getImages().stream()
                .map(this::toImageResponse)
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
                imageResponses,
                product.getCreatedAt(),
                product.getUpdatedAt()
        );
    }

    public ProductListResponse toListResponse(Product product) {
        String primaryImageUrl = product.getImages().stream()
                .filter(ProductImage::isPrimary)
                .map(ProductImage::getImageUrl)
                .findFirst()
                .orElse(null);

        return new ProductListResponse(
                product.getId(),
                product.getTitle(),
                product.getCategory(),
                product.getCondition(),
                product.getCreditValue(),
                primaryImageUrl,
                product.getCreatedAt()
        );
    }

    private ProductImageResponse toImageResponse(ProductImage image) {
        return new ProductImageResponse(
                image.getId(),
                image.getImageUrl(),
                image.isPrimary(),
                image.getDisplayOrder()
        );
    }
}
