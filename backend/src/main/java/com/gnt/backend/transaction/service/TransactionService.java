package com.gnt.backend.transaction.service;

import com.gnt.backend.transaction.dto.TransactionInitiateRequest;
import com.gnt.backend.transaction.dto.TransactionResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface TransactionService {
    TransactionResponse initiateTransaction(TransactionInitiateRequest request, Long buyerId);
    TransactionResponse getTransactionById(Long transactionId, Long userId);
    TransactionResponse buyerConfirm(String qrToken, Long buyerId);
    TransactionResponse sellerConfirm(String qrToken, Long sellerId);
    TransactionResponse cancelTransaction(Long transactionId, Long userId);
    Page<TransactionResponse> getMyTransactions(Long userId, Pageable pageable);

    /** Settles one overdue exchange in its own database transaction. No-op if no longer due. */
    void settleIfExpired(Long transactionId);
}
