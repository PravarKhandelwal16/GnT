package com.gnt.backend.transaction.mapper;

import com.gnt.backend.domain.entity.Product;
import com.gnt.backend.domain.entity.ProductMedia;
import com.gnt.backend.domain.entity.Transaction;
import com.gnt.backend.domain.enums.TransactionStatus;
import com.gnt.backend.rating.repository.RatingRepository;
import com.gnt.backend.transaction.dto.TransactionResponse;
import org.springframework.stereotype.Component;

@Component
public class TransactionMapper {

    private final RatingRepository ratingRepository;

    public TransactionMapper(RatingRepository ratingRepository) {
        this.ratingRepository = ratingRepository;
    }

    public TransactionResponse toResponse(Transaction tx, Long viewerId) {
        boolean viewerIsBuyer = tx.getBuyer().getId().equals(viewerId);
        boolean open = tx.getStatus() == TransactionStatus.INITIATED
                || tx.getStatus() == TransactionStatus.WAITING_CONFIRMATION;
        boolean revealPickup = viewerIsBuyer && (open || tx.getStatus() == TransactionStatus.COMPLETED);
        Product product = tx.getProduct();

        String counterpartPhone = null;
        if (open) {
            counterpartPhone = viewerIsBuyer ? tx.getSeller().getPhone() : tx.getBuyer().getPhone();
        }

        return new TransactionResponse(
                tx.getId(),
                product.getId(),
                product.getTitle(),
                product.getMedia().stream()
                        .filter(ProductMedia::isPrimary)
                        .map(ProductMedia::getMediaUrl)
                        .findFirst()
                        .orElse(null),
                tx.getBuyer().getId(),
                tx.getBuyer().getName(),
                tx.getSeller().getId(),
                tx.getSeller().getName(),
                tx.getCreditsUsed(),
                viewerIsBuyer && open ? tx.getQrToken() : null,
                tx.isBuyerConfirmed(),
                tx.isSellerConfirmed(),
                tx.getStatus(),
                revealPickup ? formatAddress(product) : null,
                counterpartPhone,
                tx.getStatus() == TransactionStatus.COMPLETED
                        && ratingRepository.existsByTransactionIdAndReviewerId(tx.getId(), viewerId),
                tx.getExpiresAt(),
                tx.getCreatedAt(),
                tx.getCompletedAt(),
                tx.getCancelledAt()
        );
    }

    private String formatAddress(Product p) {
        return String.join(", ", p.getStreet(), p.getCity(), p.getState(), p.getPostalCode(), p.getCountry());
    }
}
