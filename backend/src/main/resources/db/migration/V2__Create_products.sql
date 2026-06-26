CREATE TABLE products
(
    id             BIGINT       NOT NULL AUTO_INCREMENT,
    owner_id       BIGINT       NOT NULL,
    title          VARCHAR(255) NOT NULL,
    description    TEXT         NOT NULL,
    category       VARCHAR(30)  NOT NULL,
    `condition`    VARCHAR(20)  NOT NULL,
    credit_value   INT          NOT NULL,
    pickup_address VARCHAR(500) NOT NULL,
    status         VARCHAR(30)  NOT NULL DEFAULT 'DRAFT',
    version        INT          NOT NULL DEFAULT 0,
    created_at     DATETIME     NOT NULL,
    updated_at     DATETIME     NOT NULL,

    CONSTRAINT pk_products            PRIMARY KEY (id),
    CONSTRAINT fk_products_owner      FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT chk_products_category  CHECK (category IN ('BOOKS', 'CLOTHES', 'SHOES', 'ELECTRONICS', 'FURNITURE', 'TOYS', 'ACCESSORIES', 'KITCHEN_ITEMS')),
    CONSTRAINT chk_products_condition CHECK (`condition` IN ('NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR')),
    CONSTRAINT chk_products_status    CHECK (status IN ('DRAFT', 'PENDING_AI_REVIEW', 'ACTIVE', 'LOCKED', 'EXCHANGED', 'REJECTED', 'DELETED')),
    CONSTRAINT chk_products_credit    CHECK (credit_value > 0),

    -- Supports browse/search filtering by status and category
    INDEX idx_products_status   (status),
    INDEX idx_products_category (category),

    -- Supports "my listings" page filtered by status (owner_id already indexed by FK)
    INDEX idx_products_owner_status (owner_id, status)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;
