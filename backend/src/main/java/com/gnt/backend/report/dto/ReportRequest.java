package com.gnt.backend.report.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ReportRequest(
        @NotNull(message = "Product ID is required")
        Long productId,

        @NotBlank(message = "Reason is required")
        @Size(max = 100, message = "Reason cannot exceed 100 characters")
        String reason,

        @Size(max = 1000, message = "Description cannot exceed 1000 characters")
        String description
) {}
