package com.gnt.backend.domain.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/** One staff action. Append-only: never updated or deleted. */
@Entity
@Table(name = "staff_audit_log")
@Getter
@Setter
@NoArgsConstructor
public class StaffAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "actor_id", nullable = false, foreignKey = @ForeignKey(name = "fk_staff_audit_log_actor"))
    private User actor;

    @Column(name = "action", nullable = false, length = 40)
    private String action;

    @Column(name = "target_type", nullable = false, length = 20)
    private String targetType;

    @Column(name = "target_id", nullable = false)
    private Long targetId;

    @Column(name = "details", nullable = false, length = 1000)
    private String details;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
