package com.gnt.backend.admin;

import com.gnt.backend.domain.entity.StaffAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StaffAuditLogRepository extends JpaRepository<StaffAuditLog, Long> {
}
