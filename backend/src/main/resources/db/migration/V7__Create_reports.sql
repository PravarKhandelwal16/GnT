CREATE TABLE reports
(
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    reporter_id BIGINT       NOT NULL,
    product_id  BIGINT       NOT NULL,
    reason      VARCHAR(255) NOT NULL,
    description TEXT         NOT NULL,
    status      VARCHAR(20)  NOT NULL DEFAULT 'OPEN',
    created_at  DATETIME     NOT NULL,

    CONSTRAINT pk_reports              PRIMARY KEY (id),
    CONSTRAINT uq_reports_one_per_user UNIQUE (product_id, reporter_id),
    CONSTRAINT fk_reports_reporter     FOREIGN KEY (reporter_id) REFERENCES users (id)     ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_reports_product      FOREIGN KEY (product_id)  REFERENCES products (id)  ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT chk_reports_status      CHECK (status IN ('OPEN', 'CLOSED')),

    -- Supports admin moderation dashboard filtering by status
    INDEX idx_reports_status (status)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;
