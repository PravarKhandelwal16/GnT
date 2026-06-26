package com.gnt.backend.domain.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;

/**
 * Records a rating and optional review left by one user for another after a completed exchange.
 *
 * <p>Business rules:
 * <ul>
 *   <li>A reviewer may submit <strong>exactly one</strong> rating per transaction —
 *       enforced by the unique constraint {@code uq_ratings_one_per_tx (transaction_id, reviewer_id)}.</li>
 *   <li>{@code review} text is optional and may be null.</li>
 *   <li>{@code rating} must be between 1 and 5 inclusive.</li>
 *   <li>Ratings are immutable once submitted; there is no {@code updatedAt} field.</li>
 * </ul>
 */
@Entity
@Table(
        name = "ratings",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uq_ratings_one_per_tx",
                        columnNames = {"transaction_id", "reviewer_id"}
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@ToString(exclude = {"transaction", "reviewer", "reviewee"})
public class Rating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    // ── References ────────────────────────────────────────────────────────────

    /**
     * The exchange transaction this rating is associated with.
     * Only completed transactions may be rated (enforced by the service layer).
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "transaction_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_ratings_transaction")
    )
    private Transaction transaction;

    /** The user who submitted this rating. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "reviewer_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_ratings_reviewer")
    )
    private User reviewer;

    /** The user who received this rating. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "reviewee_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_ratings_reviewee")
    )
    private User reviewee;

    // ── Rating ────────────────────────────────────────────────────────────────

    /**
     * Numeric rating from 1 (lowest) to 5 (highest).
     * Range enforced by the database CHECK constraint {@code chk_ratings_value}.
     */
    @Column(name = "rating", nullable = false)
    private Byte rating;

    /**
     * Optional free-text review. May be null.
     */
    @Column(name = "review", columnDefinition = "TEXT")
    private String review;

    // ── Audit ─────────────────────────────────────────────────────────────────

    /**
     * Timestamp of submission. Immutable — ratings are never updated after creation.
     */
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
        if (!(o instanceof Rating other)) return false;
        return id != null && id.equals(other.id);
    }

    @Override
    public final int hashCode() {
        return getClass().hashCode();
    }
}
