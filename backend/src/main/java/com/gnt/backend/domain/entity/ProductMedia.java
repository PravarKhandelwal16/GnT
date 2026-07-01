package com.gnt.backend.domain.entity;

import com.gnt.backend.domain.enums.MediaType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;

/**
 * Represents a single media file associated with a {@link Product}.
 *
 * <p>Business rules:
 * <ul>
 *   <li>Every active product must have at least one media file (enforced by the service layer).</li>
 *   <li>Exactly one media per product must have {@code isPrimary = true} (enforced by the service layer).</li>
 *   <li>Only IMAGE media can be primary.</li>
 *   <li>Media files support display ordering via {@code displayOrder}.</li>
 * </ul>
 */
@Entity
@Table(name = "product_media")
@Getter
@Setter
@NoArgsConstructor
@ToString(exclude = {"product"})
public class ProductMedia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    // ── References ────────────────────────────────────────────────────────────

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "product_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_product_media_product")
    )
    private Product product;

    // ── Media ─────────────────────────────────────────────────────────────────

    @Column(name = "media_url", nullable = false, length = 500)
    private String mediaUrl;

    @Column(name = "imagekit_file_id", length = 255)
    private String imagekitFileId;

    @Enumerated(EnumType.STRING)
    @Column(name = "media_type", nullable = false, length = 20)
    private MediaType mediaType = MediaType.IMAGE;

    /**
     * Marks this media as the primary (thumbnail) for the product.
     * Exactly one image per product must be primary. Videos cannot be primary.
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

    // ── Identity ──────────────────────────────────────────────────────────────

    @Override
    public final boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ProductMedia other)) return false;
        return id != null && id.equals(other.id);
    }

    @Override
    public final int hashCode() {
        return getClass().hashCode();
    }
}
