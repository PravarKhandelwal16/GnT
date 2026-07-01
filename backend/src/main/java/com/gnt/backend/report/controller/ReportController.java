package com.gnt.backend.report.controller;

import com.gnt.backend.report.dto.ReportRequest;
import com.gnt.backend.report.dto.ReportResponse;
import com.gnt.backend.report.service.ReportService;
import com.gnt.backend.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @PostMapping
    public ResponseEntity<ReportResponse> submitReport(
            @Valid @RequestBody ReportRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        ReportResponse response = reportService.submitReport(request, userPrincipal.getId());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/my-reports")
    public ResponseEntity<Page<ReportResponse>> getMyReports(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            Pageable pageable) {
        return ResponseEntity.ok(reportService.getMyReports(userPrincipal.getId(), pageable));
    }
}
