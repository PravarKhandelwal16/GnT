package com.gnt.backend.domain.entity;

import com.gnt.backend.domain.enums.TransactionStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;

/**
 * Records every exchange attempt between a buyer and a seller on the GnT platform.
 *
 * <p>Lifecycle:
 * <ol>
 *   <li>{@code INITIATED} – buyer initiates; credits deducted from buyer and held in escrow.</li>
 *   <li>{@code WAITING_CONFIRMATION} – QR code scanned; waiting for both parties to confirm.</li>
 *   <li>{@code COMPLETED} – both parties confirmed; escrow released to seller.</li>
 *   <li>{@code CANCELLED} – either party cancelled; buyer refunded.</li>
 *   <li>{@code EXPIRED} – 2-minute timer elapsed without completion; buyer refunded, product unlocked.</li>
 * </ol>
 *
 * <p>QR tokens are retained after terminal status changes for historical/audit purposes.
 */
@Entity
@Table(name = "transactions")
@Getter
@Setter
@NoArgsConstructor
@ToString(exclude = {"product", "seller", "buyer"})
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    // ── References ────────────────────────────────────────────────────────────

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "product_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_transactions_product")
    )
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "seller_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_transactions_seller")
    )
    private User seller;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "buyer_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_transactions_buyer")
    )
    private User buyer;

    // ── Credits ───────────────────────────────────────────────────────────────

    /**
     * Credits deducted from the buyer at transaction initiation.
     * Held in escrow until completion or refunded on cancellation/expiry.
     */
    @Column(name = "credits_used", nullable = false)
    private Integer creditsUsed;

    // ── QR ────────────────────────────────────────────────────────────────────

    /**
     * Unique token embedded in the QR code used to identify this transaction at handoff.
     * Stored permanently for audit purposes even after the transaction reaches a terminal state.
     */
    @Column(name = "qr_token", nullable = false, unique = true, length = 255)
    private String qrToken;

    // ── Confirmation ──────────────────────────────────────────────────────────

    @Column(name = "buyer_confirmed", nullable = false)
    private boolean buyerConfirmed = false;

    @Column(name = "seller_confirmed", nullable = false)
    private boolean sellerConfirmed = false;

    // ── Status ────────────────────────────────────────────────────────────────

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private TransactionStatus status = TransactionStatus.INITIATED;

    // ── Timer ─────────────────────────────────────────────────────────────────

    /**
     * Point in time after which this transaction automatically transitions to {@code EXPIRED}
     * if not yet completed. Set to {@code createdAt + 2 minutes} by the service layer.
     */
    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    // ── Audit ─────────────────────────────────────────────────────────────────

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /** Set by the service layer when status transitions to {@code COMPLETED}. */
    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    /** Set by the service layer when status transitions to {@code CANCELLED} or {@code EXPIRED}. */
    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // ── Identity ──────────────────────────────────────────────────────────────

    @Override
    public final boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Transaction other)) return false;
        return id != null && id.equals(other.id);
    }

    @Override
    public final int hashCode() {
        return getClass().hashCode();
    }
}
