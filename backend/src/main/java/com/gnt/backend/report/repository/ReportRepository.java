package com.gnt.backend.report.repository;

import com.gnt.backend.domain.entity.Report;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    boolean existsByProductIdAndReporterId(Long productId, Long reporterId);
    Page<Report> findByReporterIdOrderByCreatedAtDesc(Long reporterId, Pageable pageable);
}
