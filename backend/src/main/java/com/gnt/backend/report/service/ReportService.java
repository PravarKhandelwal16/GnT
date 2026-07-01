package com.gnt.backend.report.service;

import com.gnt.backend.report.dto.ReportRequest;
import com.gnt.backend.report.dto.ReportResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ReportService {
    ReportResponse submitReport(ReportRequest request, Long reporterId);
    Page<ReportResponse> getMyReports(Long reporterId, Pageable pageable);
}
