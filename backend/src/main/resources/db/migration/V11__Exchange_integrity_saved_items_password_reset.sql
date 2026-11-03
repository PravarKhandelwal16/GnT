-- Record what each listing actually paid out, so payouts and clawbacks use the
-- real figure instead of recalculating it from an editable credit value.
ALTER TABLE products
    ADD COLUMN listing_bonus INT NOT NULL DEFAULT 0;

UPDATE products
SET listing_bonus = FLOOR(credit_value * 0.4)
WHERE id > 0;

-- Listing clawbacks and value edits get their own ledger type (they were mislabelled REFUND).
ALTER TABLE credit_history
    DROP CHECK chk_credit_history_type;

ALTER TABLE credit_history
    ADD CONSTRAINT chk_credit_history_type CHECK (transaction_type IN (
        'INITIAL_BONUS', 'PRODUCT_APPROVED', 'PRODUCT_PURCHASE', 'PRODUCT_COMPLETED',
        'REFUND', 'MANUAL_ADJUSTMENT', 'LISTING_ADJUSTMENT'));

CREATE TABLE saved_products
(
    id         BIGINT   NOT NULL AUTO_INCREMENT,
    user_id    BIGINT   NOT NULL,
    product_id BIGINT   NOT NULL,
    created_at DATETIME NOT NULL,

    CONSTRAINT pk_saved_products      PRIMARY KEY (id),
    CONSTRAINT uq_saved_products      UNIQUE (user_id, product_id),
    CONSTRAINT fk_saved_products_user FOREIGN KEY (user_id)    REFERENCES users (id)    ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_saved_products_prod FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

-- Only a SHA-256 hash of each reset token is stored.
CREATE TABLE password_reset_tokens
(
    id         BIGINT      NOT NULL AUTO_INCREMENT,
    user_id    BIGINT      NOT NULL,
    token_hash VARCHAR(64) NOT NULL,
    expires_at DATETIME    NOT NULL,
    used_at    DATETIME    NULL,
    created_at DATETIME    NOT NULL,

    CONSTRAINT pk_password_reset_tokens PRIMARY KEY (id),
    CONSTRAINT uq_password_reset_hash   UNIQUE (token_hash),
    CONSTRAINT fk_password_reset_user   FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;
