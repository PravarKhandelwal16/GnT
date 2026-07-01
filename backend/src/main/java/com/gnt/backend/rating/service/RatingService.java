package com.gnt.backend.rating.service;

import com.gnt.backend.rating.dto.RatingRequest;
import com.gnt.backend.rating.dto.RatingResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface RatingService {
    RatingResponse submitRating(RatingRequest request, Long reviewerId);
    Page<RatingResponse> getUserRatings(Long userId, Pageable pageable);
}
