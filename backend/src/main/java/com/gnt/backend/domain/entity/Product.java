package com.gnt.backend.domain.entity;

import com.gnt.backend.domain.enums.Category;
import com.gnt.backend.domain.enums.Condition;
import com.gnt.backend.domain.enums.ProductStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Represents a product listed for exchange on the GnT platform.
 *
 * <p>Products are never physically deleted. Use {@link ProductStatus#DELETED} instead.
 *
 * <p>The {@code version} field is managed by Hibernate for optimistic locking,
 * preventing concurrent updates from corrupting product state during exchanges.
 */
@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@ToString(exclude = {"owner", "images"})
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    // ── Basic Information ────────────────────────────────────────────────────

    /**
     * The user who owns and listed this product.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "owner_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_products_owner")
    )
    private User owner;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 30)
    private Category category;

    /**
     * Physical condition of the item.
     *
     * <p>The column is named {@code condition} in MySQL, which is a reserved word.
     * Backtick quoting forces the MySQL dialect to escape it correctly at runtime.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "`condition`", nullable = false, length = 20)
    private Condition condition;

    /**
     * Credit cost a buyer must pay to acquire this product.
     * Must be a positive integer.
     */
    @Column(name = "credit_value", nullable = false)
    private Integer creditValue;

    @Column(name = "pickup_address", nullable = false, length = 500)
    private String pickupAddress;

    // ── Status ───────────────────────────────────────────────────────────────

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private ProductStatus status = ProductStatus.DRAFT;

    // ── Concurrency ──────────────────────────────────────────────────────────

    /**
     * Optimistic lock version. Hibernate increments this on every UPDATE.
     * Prevents lost-update anomalies when two transactions touch the same product.
     */
    @Version
    @Column(name = "version", nullable = false)
    private Integer version;

    // ── Images ───────────────────────────────────────────────────────────────

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    private List<ProductImage> images = new ArrayList<>();

    // ── Audit ─────────────────────────────────────────────────────────────────

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

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
        if (!(o instanceof Product other)) return false;
        return id != null && id.equals(other.id);
    }

    @Override
    public final int hashCode() {
        return getClass().hashCode();
    }
}
