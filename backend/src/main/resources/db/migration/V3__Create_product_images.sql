CREATE TABLE product_images
(
    id            BIGINT       NOT NULL AUTO_INCREMENT,
    product_id    BIGINT       NOT NULL,
    image_url     VARCHAR(500) NOT NULL,
    is_primary    TINYINT(1)   NOT NULL DEFAULT 0,
    display_order INT          NOT NULL DEFAULT 0,
    uploaded_at   DATETIME     NOT NULL,

    CONSTRAINT pk_product_images         PRIMARY KEY (id),
    CONSTRAINT fk_product_images_product FOREIGN KEY (product_id) REFERENCES products (id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;
