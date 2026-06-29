package com.gnt.backend.transaction.service;

import com.gnt.backend.transaction.dto.TransactionInitiateRequest;
import com.gnt.backend.transaction.dto.TransactionResponse;

public interface TransactionService {
    TransactionResponse initiateTransaction(TransactionInitiateRequest request, Long buyerId);
    TransactionResponse getTransactionById(Long transactionId, Long userId);
    TransactionResponse buyerConfirm(String qrToken, Long buyerId);
    TransactionResponse sellerConfirm(String qrToken, Long sellerId);
    TransactionResponse cancelTransaction(Long transactionId, Long userId);
}
