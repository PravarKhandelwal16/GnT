-- Add new address columns
ALTER TABLE products
ADD COLUMN street VARCHAR(255),
ADD COLUMN city VARCHAR(100),
ADD COLUMN state VARCHAR(100),
ADD COLUMN postal_code VARCHAR(20),
ADD COLUMN country VARCHAR(100);

-- Migrate existing data by copying pickup_address to street, and adding default placeholders for the rest
UPDATE products 
SET 
    street = pickup_address, 
    city = 'Unknown', 
    state = 'Unknown', 
    postal_code = '000000', 
    country = 'Unknown'
WHERE street IS NULL;

-- Make the columns NOT NULL and drop the old pickup_address column
ALTER TABLE products
MODIFY COLUMN street VARCHAR(255) NOT NULL,
MODIFY COLUMN city VARCHAR(100) NOT NULL,
MODIFY COLUMN state VARCHAR(100) NOT NULL,
MODIFY COLUMN postal_code VARCHAR(20) NOT NULL,
MODIFY COLUMN country VARCHAR(100) NOT NULL,
DROP COLUMN pickup_address;
