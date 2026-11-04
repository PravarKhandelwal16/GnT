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
import com.gnt.backend.exception.ApiException;
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
            throw ApiException.conflict("You have already reported this item");
        }

        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> ApiException.notFound("Product not found"));

        if (product.getOwner().getId().equals(reporterId)) {
            throw ApiException.badRequest("You can't report your own listing");
        }

        User reporter = userRepository.findById(reporterId)
                .orElseThrow(() -> ApiException.notFound("Reporter not found"));

        Report report = new Report();
        report.setProduct(product);
        report.setReporter(reporter);
        report.setReason(request.reason());
        report.setDescription(request.description() != null ? request.description() : "");
        report.setStatus(ReportStatus.OPEN);

        Report savedReport = reportRepository.save(report);

        return reportMapper.toResponse(savedReport);
    }
}
