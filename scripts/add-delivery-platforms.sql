-- Add delivery platform links to listings table
-- Run this in Supabase SQL editor to add support for Deliveroo, Uber Eats, and OpenTable links

-- Add the new columns if they don't exist
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS delivery_deliveroo VARCHAR,
ADD COLUMN IF NOT EXISTS delivery_ubereats VARCHAR,
ADD COLUMN IF NOT EXISTS delivery_opentable VARCHAR;

-- Add comments to document the columns
COMMENT ON COLUMN listings.delivery_deliveroo IS 'Deliveroo restaurant profile URL (e.g., https://deliveroo.co.uk/menu/...)';
COMMENT ON COLUMN listings.delivery_ubereats IS 'Uber Eats restaurant profile URL (e.g., https://www.ubereats.com/...)';
COMMENT ON COLUMN listings.delivery_opentable IS 'OpenTable reservation link (e.g., https://www.opentable.com/r/...)';

-- Create an index for faster queries (optional, for performance)
CREATE INDEX IF NOT EXISTS idx_listings_delivery_deliveroo ON listings(delivery_deliveroo) 
WHERE delivery_deliveroo IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_listings_delivery_ubereats ON listings(delivery_ubereats) 
WHERE delivery_ubereats IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_listings_delivery_opentable ON listings(delivery_opentable) 
WHERE delivery_opentable IS NOT NULL;
