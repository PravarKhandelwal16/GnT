package com.gnt.backend.rating.repository;

import com.gnt.backend.domain.entity.Rating;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Long> {
    
    boolean existsByTransactionIdAndReviewerId(Long transactionId, Long reviewerId);

    Page<Rating> findByRevieweeIdOrderByCreatedAtDesc(Long revieweeId, Pageable pageable);

    @Query("SELECT AVG(r.rating) FROM Rating r WHERE r.reviewee.id = :revieweeId")
    Double getAverageRatingForUser(@Param("revieweeId") Long revieweeId);
}
