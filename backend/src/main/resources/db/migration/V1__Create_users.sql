CREATE TABLE users
(
    id             BIGINT        NOT NULL AUTO_INCREMENT,
    name           VARCHAR(255)  NOT NULL,
    email          VARCHAR(255)  NOT NULL,
    phone          VARCHAR(30)   NOT NULL,
    password       VARCHAR(255)  NOT NULL,
    street         VARCHAR(255)  NULL,
    city           VARCHAR(100)  NULL,
    state          VARCHAR(100)  NULL,
    postal_code    VARCHAR(20)   NULL,
    country        VARCHAR(100)  NULL,
    date_of_birth  DATE          NULL,
    profile_image  VARCHAR(500)  NULL,
    credit_balance INT           NOT NULL DEFAULT 0,
    rating         DECIMAL(3, 2) NOT NULL DEFAULT 0.00,
    status         VARCHAR(20)   NOT NULL DEFAULT 'ACTIVE',
    email_verified TINYINT(1)    NOT NULL DEFAULT 0,
    phone_verified TINYINT(1)    NOT NULL DEFAULT 0,
    created_at     DATETIME      NOT NULL,
    updated_at     DATETIME      NOT NULL,

    CONSTRAINT pk_users             PRIMARY KEY (id),
    CONSTRAINT uq_users_email       UNIQUE (email),
    CONSTRAINT uq_users_phone       UNIQUE (phone),
    CONSTRAINT chk_users_status     CHECK (status IN ('ACTIVE', 'SUSPENDED', 'DELETED')),
    CONSTRAINT chk_users_balance    CHECK (credit_balance >= 0),
    CONSTRAINT chk_users_rating     CHECK (rating >= 0.00 AND rating <= 5.00),

    -- Supports filtering the user list by account state (e.g. admin suspensions)
    INDEX idx_users_status (status)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;
