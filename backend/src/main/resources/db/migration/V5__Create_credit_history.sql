CREATE TABLE credit_history
(
    id               BIGINT       NOT NULL AUTO_INCREMENT,
    user_id          BIGINT       NOT NULL,
    transaction_id   BIGINT       NULL,
    amount           INT          NOT NULL,
    transaction_type VARCHAR(30)  NOT NULL,
    description      VARCHAR(500) NOT NULL,
    created_at       DATETIME     NOT NULL,

    CONSTRAINT pk_credit_history             PRIMARY KEY (id),
    CONSTRAINT fk_credit_history_user        FOREIGN KEY (user_id)        REFERENCES users (id)        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_credit_history_transaction FOREIGN KEY (transaction_id) REFERENCES transactions (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT chk_credit_history_type       CHECK (transaction_type IN ('INITIAL_BONUS', 'PRODUCT_APPROVED', 'PRODUCT_PURCHASE', 'PRODUCT_COMPLETED', 'REFUND', 'MANUAL_ADJUSTMENT')),

    -- Supports paginated credit history ordered by date for a given user
    INDEX idx_credit_history_user_created (user_id, created_at)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;
