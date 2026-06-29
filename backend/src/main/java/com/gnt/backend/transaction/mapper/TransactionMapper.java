package com.gnt.backend.transaction.mapper;

import com.gnt.backend.domain.entity.Transaction;
import com.gnt.backend.transaction.dto.TransactionResponse;
import org.springframework.stereotype.Component;

@Component
public class TransactionMapper {

    public TransactionResponse toResponse(Transaction transaction) {
        return new TransactionResponse(
                transaction.getId(),
                transaction.getProduct().getId(),
                transaction.getProduct().getTitle(),
                transaction.getBuyer().getId(),
                transaction.getBuyer().getName(),
                transaction.getSeller().getId(),
                transaction.getSeller().getName(),
                transaction.getCreditsUsed(),
                transaction.getQrToken(),
                transaction.isBuyerConfirmed(),
                transaction.isSellerConfirmed(),
                transaction.getStatus(),
                transaction.getExpiresAt(),
                transaction.getCreatedAt(),
                transaction.getCompletedAt(),
                transaction.getCancelledAt()
        );
    }
}
