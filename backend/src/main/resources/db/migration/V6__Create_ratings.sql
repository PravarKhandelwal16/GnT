CREATE TABLE ratings
(
    id             BIGINT   NOT NULL AUTO_INCREMENT,
    transaction_id BIGINT   NOT NULL,
    reviewer_id    BIGINT   NOT NULL,
    reviewee_id    BIGINT   NOT NULL,
    rating         TINYINT  NOT NULL,
    review         TEXT     NULL,
    created_at     DATETIME NOT NULL,

    CONSTRAINT pk_ratings             PRIMARY KEY (id),
    CONSTRAINT uq_ratings_one_per_tx  UNIQUE (transaction_id, reviewer_id),
    CONSTRAINT fk_ratings_transaction FOREIGN KEY (transaction_id) REFERENCES transactions (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_ratings_reviewer    FOREIGN KEY (reviewer_id)    REFERENCES users (id)        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_ratings_reviewee    FOREIGN KEY (reviewee_id)    REFERENCES users (id)        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT chk_ratings_value      CHECK (rating BETWEEN 1 AND 5)

    -- transaction_id, reviewer_id, and reviewee_id are all automatically
    -- indexed by MySQL for their FK constraints above. No additional indexes required.
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;
