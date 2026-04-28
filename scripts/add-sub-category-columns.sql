-- Add sub_category and sub_category_slug columns to listings table
-- These columns store the refined subcategory (e.g., 'Pizza', 'Yoga', 'Furniture')

ALTER TABLE listings ADD COLUMN IF NOT EXISTS sub_category TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS sub_category_slug TEXT;

-- Create index for filtering by sub_category
CREATE INDEX IF NOT EXISTS idx_listings_sub_category ON listings(sub_category);
CREATE INDEX IF NOT EXISTS idx_listings_category_sub_category ON listings(category_slug, sub_category);

-- Sample: Populate based on existing image_category for now (will be replaced by import)
-- This is a fallback until we import the enriched CSV
UPDATE listings 
SET sub_category = image_category 
WHERE sub_category IS NULL AND image_category IS NOT NULL;

-- Create sub_category_slug from sub_category (lowercase, hyphens instead of spaces)
UPDATE listings 
SET sub_category_slug = LOWER(REPLACE(REPLACE(sub_category, ' ', '-'), '&', 'and'))
WHERE sub_category_slug IS NULL AND sub_category IS NOT NULL;
