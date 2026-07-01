package com.gnt.backend.rating.mapper;

import com.gnt.backend.domain.entity.Rating;
import com.gnt.backend.rating.dto.RatingResponse;
import org.springframework.stereotype.Component;

@Component
public class RatingMapper {

    public RatingResponse toResponse(Rating rating) {
        return new RatingResponse(
                rating.getId(),
                rating.getTransaction().getId(),
                rating.getReviewer().getId(),
                rating.getReviewer().getName(),
                rating.getReviewee().getId(),
                rating.getReviewee().getName(),
                rating.getRating() != null ? rating.getRating().intValue() : null,
                rating.getReview(),
                rating.getCreatedAt()
        );
    }
}
