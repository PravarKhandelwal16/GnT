package com.gnt.backend.product.repository;

import com.gnt.backend.domain.entity.Product;
import com.gnt.backend.domain.enums.Category;
import com.gnt.backend.domain.enums.Condition;
import com.gnt.backend.domain.enums.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    // Find products by status and optional category/condition filters
    @Query("SELECT p FROM Product p WHERE p.status = :status " +
           "AND (:category IS NULL OR p.category = :category) " +
           "AND (:condition IS NULL OR p.condition = :condition) " +
           "ORDER BY p.createdAt DESC")
    Page<Product> findProductsWithFilters(
            @Param("status") ProductStatus status,
            @Param("category") Category category,
            @Param("condition") Condition condition,
            Pageable pageable);

    // Find all products owned by a specific user
    Page<Product> findByOwnerIdOrderByCreatedAtDesc(Long ownerId, Pageable pageable);
}
