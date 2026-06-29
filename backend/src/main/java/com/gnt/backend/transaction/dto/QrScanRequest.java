package com.gnt.backend.transaction.dto;

import jakarta.validation.constraints.NotBlank;

public record QrScanRequest(
        @NotBlank(message = "QR Token is required")
        String qrToken
) {}
