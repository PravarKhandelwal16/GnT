package com.gnt.backend.product.repository;

import com.gnt.backend.domain.entity.ProductMedia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductMediaRepository extends JpaRepository<ProductMedia, Long> {
    List<ProductMedia> findByProductIdOrderByDisplayOrderAsc(Long productId);
}
