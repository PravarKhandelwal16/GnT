package com.gnt.backend.report.mapper;

import com.gnt.backend.domain.entity.Report;
import com.gnt.backend.report.dto.ReportResponse;
import org.springframework.stereotype.Component;

@Component
public class ReportMapper {

    public ReportResponse toResponse(Report report) {
        return new ReportResponse(
                report.getId(),
                report.getProduct().getId(),
                report.getProduct().getTitle(),
                report.getReporter().getId(),
                report.getReporter().getName(),
                report.getReason(),
                report.getDescription(),
                report.getStatus(),
                report.getCreatedAt()
        );
    }
}
