package com.gnt.backend.domain.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Represents a single image associated with a {@link Product}.
 *
 * <p>Business rules:
 * <ul>
 *   <li>Every active product must have at least one image (enforced by the service layer).</li>
 *   <li>Exactly one image per product must have {@code isPrimary = true} (enforced by the service layer).</li>
 *   <li>Images support display ordering via {@code displayOrder}.</li>
 * </ul>
 */
@Entity
@Table(name = "product_images")
@Getter
@Setter
@NoArgsConstructor
public class ProductImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    // ── References ────────────────────────────────────────────────────────────

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "product_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_product_images_product")
    )
    private Product product;

    // ── Image ─────────────────────────────────────────────────────────────────

    @Column(name = "image_url", nullable = false, length = 500)
    private String imageUrl;

    /**
     * Marks this image as the primary (thumbnail) image for the product.
     * Exactly one image per product must be primary.
     */
    @Column(name = "is_primary", nullable = false)
    private boolean isPrimary = false;

    /**
     * Zero-based ordering index used to determine display sequence.
     */
    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    // ── Audit ─────────────────────────────────────────────────────────────────

    @Column(name = "uploaded_at", nullable = false, updatable = false)
    private LocalDateTime uploadedAt;

    @PrePersist
    protected void onCreate() {
        this.uploadedAt = LocalDateTime.now();
    }
}
