package com.gnt.backend.product.repository;

import com.gnt.backend.domain.entity.Product;
import com.gnt.backend.domain.enums.Category;
import com.gnt.backend.domain.enums.Condition;
import com.gnt.backend.domain.enums.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // Ordering comes from the Pageable so callers can sort by date or credit value.
    @Query("SELECT p FROM Product p WHERE p.status = :status " +
           "AND p.owner.status = com.gnt.backend.domain.enums.UserStatus.ACTIVE " +
           "AND (:category IS NULL OR p.category = :category) " +
           "AND (:condition IS NULL OR p.condition = :condition) " +
           "AND (:pattern IS NULL OR LOWER(p.title) LIKE :pattern ESCAPE '!' " +
           "     OR LOWER(p.description) LIKE :pattern ESCAPE '!' " +
           "     OR LOWER(p.city) LIKE :pattern ESCAPE '!')")
    Page<Product> findProductsWithFilters(
            @Param("status") ProductStatus status,
            @Param("category") Category category,
            @Param("condition") Condition condition,
            @Param("pattern") String pattern,
            Pageable pageable);

    Page<Product> findByOwnerIdAndStatusNotOrderByCreatedAtDesc(Long ownerId, ProductStatus status, Pageable pageable);

    long countByOwnerIdAndStatus(Long ownerId, ProductStatus status);

    boolean existsByOwnerIdAndTitle(Long ownerId, String title);

    @Modifying
    @Query("UPDATE Product p SET p.status = :to, p.version = p.version + 1 " +
           "WHERE p.owner.id = :ownerId AND p.status = :from")
    int updateStatusForOwner(@Param("ownerId") Long ownerId,
                             @Param("from") ProductStatus from,
                             @Param("to") ProductStatus to);
}
