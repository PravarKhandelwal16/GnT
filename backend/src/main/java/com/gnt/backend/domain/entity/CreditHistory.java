package com.gnt.backend.domain.entity;

import com.gnt.backend.domain.enums.CreditHistoryType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;

/**
 * An immutable ledger entry recording every credit movement for a user.
 *
 * <p>Business rules:
 * <ul>
 *   <li>Records are <strong>append-only</strong> — they are never updated or deleted.</li>
 *   <li>{@code amount} is a signed value: positive for credits earned, negative for credits spent.</li>
 *   <li>{@code transaction} is nullable — entries such as {@code INITIAL_BONUS} and
 *       {@code MANUAL_ADJUSTMENT} are not linked to any exchange transaction.</li>
 * </ul>
 *
 * <p>No {@code updatedAt} field is present by design; mutating an existing record
 * is a violation of the append-only contract.
 */
@Entity
@Table(name = "credit_history")
@Getter
@Setter
@NoArgsConstructor
@ToString(exclude = {"user", "transaction"})
public class CreditHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    // ── References ────────────────────────────────────────────────────────────

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_credit_history_user")
    )
    private User user;

    /**
     * The exchange transaction that triggered this credit movement.
     * Null for entries not linked to a transaction (e.g. {@code INITIAL_BONUS}).
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "transaction_id",
            nullable = true,
            foreignKey = @ForeignKey(name = "fk_credit_history_transaction")
    )
    private Transaction transaction;

    // ── Credit Movement ───────────────────────────────────────────────────────

    /**
     * Signed credit amount.
     * Positive values represent credits earned; negative values represent credits spent.
     */
    @Column(name = "amount", nullable = false)
    private Integer amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false, length = 30)
    private CreditHistoryType transactionType;

    @Column(name = "description", nullable = false, length = 500)
    private String description;

    // ── Audit ─────────────────────────────────────────────────────────────────

    /**
     * Timestamp of record creation. Never changes after insert (append-only contract).
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
        if (!(o instanceof CreditHistory other)) return false;
        return id != null && id.equals(other.id);
    }

    @Override
    public final int hashCode() {
        return getClass().hashCode();
    }
}
