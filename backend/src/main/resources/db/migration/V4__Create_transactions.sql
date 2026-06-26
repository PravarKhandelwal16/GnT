CREATE TABLE transactions
(
    id               BIGINT       NOT NULL AUTO_INCREMENT,
    product_id       BIGINT       NOT NULL,
    seller_id        BIGINT       NOT NULL,
    buyer_id         BIGINT       NOT NULL,
    credits_used     INT          NOT NULL,
    qr_token         VARCHAR(255) NOT NULL,
    buyer_confirmed  TINYINT(1)   NOT NULL DEFAULT 0,
    seller_confirmed TINYINT(1)   NOT NULL DEFAULT 0,
    status           VARCHAR(30)  NOT NULL DEFAULT 'INITIATED',
    expires_at       DATETIME     NOT NULL,
    created_at       DATETIME     NOT NULL,
    updated_at       DATETIME     NOT NULL,
    completed_at     DATETIME     NULL,
    cancelled_at     DATETIME     NULL,

    CONSTRAINT pk_transactions          PRIMARY KEY (id),
    CONSTRAINT uq_transactions_qr_token UNIQUE (qr_token),
    CONSTRAINT fk_transactions_product  FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_transactions_seller   FOREIGN KEY (seller_id)  REFERENCES users (id)    ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_transactions_buyer    FOREIGN KEY (buyer_id)   REFERENCES users (id)    ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT chk_transactions_status  CHECK (status IN ('INITIATED', 'WAITING_CONFIRMATION', 'COMPLETED', 'CANCELLED', 'EXPIRED')),
    CONSTRAINT chk_transactions_credits CHECK (credits_used > 0),

    -- Supports status-based queries (e.g. finding all INITIATED transactions for the expiry scheduler)
    INDEX idx_transactions_status (status),

    -- Critical for the expiry scheduler: SELECT ... WHERE status = 'INITIATED' AND expires_at < NOW()
    INDEX idx_transactions_expires_at (expires_at),

    -- Supports "my purchases" history page filtered by status
    INDEX idx_transactions_buyer_status  (buyer_id, status),

    -- Supports "my sales" history page filtered by status
    INDEX idx_transactions_seller_status (seller_id, status)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;
