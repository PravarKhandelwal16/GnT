-- Add has_seen_welcome column to users table
ALTER TABLE users
ADD COLUMN has_seen_welcome BOOLEAN NOT NULL DEFAULT FALSE;
