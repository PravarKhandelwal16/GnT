package com.gnt.backend.product.service;

import com.gnt.backend.domain.enums.Category;
import com.gnt.backend.domain.enums.Condition;
import com.gnt.backend.product.dto.ProductListResponse;
import com.gnt.backend.product.dto.ProductRequest;
import com.gnt.backend.product.dto.ProductResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProductService {
    ProductResponse createProduct(ProductRequest request, Long ownerId);
    ProductResponse getProductById(Long id);
    Page<ProductListResponse> getActiveProducts(Category category, Condition condition, Pageable pageable);
    Page<ProductListResponse> getUserProducts(Long ownerId, Pageable pageable);
    ProductResponse updateProduct(Long id, ProductRequest request, Long ownerId);
    void deleteProduct(Long id, Long ownerId);
}
