package com.gnt.backend.domain.entity;

import com.gnt.backend.domain.enums.ReportStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;

/**
 * Records a report filed by a user against a product on the GnT platform.
 *
 * <p>Business rules:
 * <ul>
 *   <li>A user may file <strong>at most one</strong> report per product —
 *       enforced by the unique constraint {@code uq_reports_one_per_user (product_id, reporter_id)}.</li>
 *   <li>Reports start in {@link ReportStatus#OPEN} and are resolved by setting them to
 *       {@link ReportStatus#CLOSED} (handled by the admin/moderation service layer).</li>
 * </ul>
 */
@Entity
@Table(
        name = "reports",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uq_reports_one_per_user",
                        columnNames = {"product_id", "reporter_id"}
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@ToString(exclude = {"reporter", "product"})
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    // ── References ────────────────────────────────────────────────────────────

    /** The user who filed this report. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "reporter_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_reports_reporter")
    )
    private User reporter;

    /** The product being reported. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "product_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_reports_product")
    )
    private Product product;

    // ── Report Content ────────────────────────────────────────────────────────

    /** Short reason for the report (e.g. "Misleading description", "Prohibited item"). */
    @Column(name = "reason", nullable = false, length = 255)
    private String reason;

    /** Full description provided by the reporter. */
    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    // ── Status ────────────────────────────────────────────────────────────────

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ReportStatus status = ReportStatus.OPEN;

    // ── Audit ─────────────────────────────────────────────────────────────────

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // ── Identity ──────────────────────────────────────────────────────────────

    @Override
    public final boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Report other)) return false;
        return id != null && id.equals(other.id);
    }

    @Override
    public final int hashCode() {
        return getClass().hashCode();
    }
}
