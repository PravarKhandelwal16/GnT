package com.gnt.backend.report.service;

import com.gnt.backend.report.dto.ReportRequest;
import com.gnt.backend.report.dto.ReportResponse;

public interface ReportService {
    ReportResponse submitReport(ReportRequest request, Long reporterId);
}
