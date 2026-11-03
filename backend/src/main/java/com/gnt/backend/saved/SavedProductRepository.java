package com.gnt.backend.saved;

import com.gnt.backend.domain.entity.Product;
import com.gnt.backend.domain.entity.SavedProduct;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SavedProductRepository extends JpaRepository<SavedProduct, Long> {

    boolean existsByUserIdAndProductId(Long userId, Long productId);

    void deleteByUserIdAndProductId(Long userId, Long productId);

    @Query("SELECT s.product.id FROM SavedProduct s WHERE s.user.id = :userId")
    List<Long> findProductIds(@Param("userId") Long userId);

    @Query("SELECT s.product FROM SavedProduct s " +
           "WHERE s.user.id = :userId AND s.product.status <> com.gnt.backend.domain.enums.ProductStatus.DELETED " +
           "ORDER BY s.createdAt DESC")
    Page<Product> findSavedProducts(@Param("userId") Long userId, Pageable pageable);
}
