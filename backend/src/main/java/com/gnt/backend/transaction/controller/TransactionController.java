package com.gnt.backend.transaction.controller;

import com.gnt.backend.security.UserPrincipal;
import com.gnt.backend.transaction.dto.QrScanRequest;
import com.gnt.backend.transaction.dto.TransactionInitiateRequest;
import com.gnt.backend.transaction.dto.TransactionResponse;
import com.gnt.backend.transaction.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @PostMapping("/initiate")
    public ResponseEntity<TransactionResponse> initiateTransaction(
            @Valid @RequestBody TransactionInitiateRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        TransactionResponse response = transactionService.initiateTransaction(request, userPrincipal.getId());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransactionResponse> getTransactionById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(transactionService.getTransactionById(id, userPrincipal.getId()));
    }

    @PostMapping("/confirm-buyer")
    public ResponseEntity<TransactionResponse> confirmBuyer(
            @Valid @RequestBody QrScanRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(transactionService.buyerConfirm(request.qrToken(), userPrincipal.getId()));
    }

    @PostMapping("/confirm-seller")
    public ResponseEntity<TransactionResponse> confirmSeller(
            @Valid @RequestBody QrScanRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(transactionService.sellerConfirm(request.qrToken(), userPrincipal.getId()));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<TransactionResponse> cancelTransaction(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(transactionService.cancelTransaction(id, userPrincipal.getId()));
    }
}
