-- 1. Rename the table
RENAME TABLE product_images TO product_media;

-- 2. Rename the column `image_url` to `media_url`
ALTER TABLE product_media CHANGE image_url media_url VARCHAR(500) NOT NULL;

-- 3. Add `imagekit_file_id` (nullable initially as old records don't have it)
ALTER TABLE product_media ADD COLUMN imagekit_file_id VARCHAR(255) NULL;

-- 4. Add `media_type` (default to 'IMAGE' for existing records)
ALTER TABLE product_media ADD COLUMN media_type VARCHAR(20) NOT NULL DEFAULT 'IMAGE';

-- 5. Drop the old foreign key constraint
ALTER TABLE product_media DROP FOREIGN KEY fk_product_images_product;

-- 6. Add the new foreign key constraint
ALTER TABLE product_media ADD CONSTRAINT fk_product_media_product FOREIGN KEY (product_id) REFERENCES products(id);
