package com.gnt.backend.report.service;

import com.gnt.backend.auth.repository.UserRepository;
import com.gnt.backend.domain.entity.Product;
import com.gnt.backend.domain.entity.Report;
import com.gnt.backend.domain.entity.User;
import com.gnt.backend.domain.enums.ReportStatus;
import com.gnt.backend.product.repository.ProductRepository;
import com.gnt.backend.report.dto.ReportRequest;
import com.gnt.backend.report.dto.ReportResponse;
import com.gnt.backend.report.mapper.ReportMapper;
import com.gnt.backend.report.repository.ReportRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReportServiceImpl implements ReportService {

    private final ReportRepository reportRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ReportMapper reportMapper;

    public ReportServiceImpl(
            ReportRepository reportRepository,
            ProductRepository productRepository,
            UserRepository userRepository,
            ReportMapper reportMapper) {
        this.reportRepository = reportRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.reportMapper = reportMapper;
    }

    @Override
    @Transactional
    public ReportResponse submitReport(ReportRequest request, Long reporterId) {
        if (reportRepository.existsByProductIdAndReporterId(request.productId(), reporterId)) {
            throw new RuntimeException("You have already reported this product");
        }

        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        User reporter = userRepository.findById(reporterId)
                .orElseThrow(() -> new RuntimeException("Reporter not found"));

        Report report = new Report();
        report.setProduct(product);
        report.setReporter(reporter);
        report.setReason(request.reason());
        report.setDescription(request.description());
        report.setStatus(ReportStatus.OPEN);

        Report savedReport = reportRepository.save(report);

        return reportMapper.toResponse(savedReport);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReportResponse> getMyReports(Long reporterId, Pageable pageable) {
        return reportRepository.findByReporterIdOrderByCreatedAtDesc(reporterId, pageable)
                .map(reportMapper::toResponse);
    }
}
