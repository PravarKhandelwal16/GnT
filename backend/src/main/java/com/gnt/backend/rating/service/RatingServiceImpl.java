package com.gnt.backend.rating.service;

import com.gnt.backend.auth.repository.UserRepository;
import com.gnt.backend.domain.entity.Rating;
import com.gnt.backend.domain.entity.Transaction;
import com.gnt.backend.domain.entity.User;
import com.gnt.backend.domain.enums.TransactionStatus;
import com.gnt.backend.rating.dto.RatingRequest;
import com.gnt.backend.rating.dto.RatingResponse;
import com.gnt.backend.rating.mapper.RatingMapper;
import com.gnt.backend.rating.repository.RatingRepository;
import com.gnt.backend.transaction.repository.TransactionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.gnt.backend.exception.ApiException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RatingServiceImpl implements RatingService {

    private final RatingRepository ratingRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final RatingMapper ratingMapper;

    public RatingServiceImpl(
            RatingRepository ratingRepository,
            TransactionRepository transactionRepository,
            UserRepository userRepository,
            RatingMapper ratingMapper) {
        this.ratingRepository = ratingRepository;
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.ratingMapper = ratingMapper;
    }

    @Override
    @Transactional
    public RatingResponse submitRating(RatingRequest request, Long reviewerId) {
        Transaction tx = transactionRepository.findById(request.transactionId())
                .orElseThrow(() -> ApiException.notFound("Transaction not found"));

        if (tx.getStatus() != TransactionStatus.COMPLETED) {
            throw ApiException.conflict("You can rate an exchange once it is complete");
        }

        if (ratingRepository.existsByTransactionIdAndReviewerId(tx.getId(), reviewerId)) {
            throw ApiException.conflict("You have already rated this exchange");
        }

        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> ApiException.notFound("Reviewer not found"));

        User reviewee;
        if (tx.getBuyer().getId().equals(reviewerId)) {
            reviewee = tx.getSeller();
        } else if (tx.getSeller().getId().equals(reviewerId)) {
            reviewee = tx.getBuyer();
        } else {
            throw ApiException.forbidden("You are not part of this exchange");
        }

        Rating rating = new Rating();
        rating.setTransaction(tx);
        rating.setReviewer(reviewer);
        rating.setReviewee(reviewee);
        rating.setRating(request.rating() != null ? request.rating().byteValue() : null);
        rating.setReview(request.review());

        Rating savedRating = ratingRepository.save(rating);

        // Recalculate average rating for reviewee
        Double average = ratingRepository.getAverageRatingForUser(reviewee.getId());
        reviewee.setRating(java.math.BigDecimal.valueOf(average != null ? average : 0.0)
                .setScale(2, java.math.RoundingMode.HALF_UP));
        userRepository.save(reviewee);

        return ratingMapper.toResponse(savedRating);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RatingResponse> getUserRatings(Long userId, Pageable pageable) {
        return ratingRepository.findByRevieweeIdOrderByCreatedAtDesc(userId, pageable)
                .map(ratingMapper::toResponse);
    }
}
