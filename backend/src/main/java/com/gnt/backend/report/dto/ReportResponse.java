package com.gnt.backend.report.dto;

import com.gnt.backend.domain.enums.ReportStatus;

import java.time.LocalDateTime;

public record ReportResponse(
        Long id,
        Long productId,
        String productTitle,
        Long reporterId,
        String reporterName,
        String reason,
        String description,
        ReportStatus status,
        LocalDateTime createdAt
) {}
