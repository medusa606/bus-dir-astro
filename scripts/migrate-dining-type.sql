-- Migration: Add dining_type field and populate from tags
-- Date: 2026-04-27
-- Purpose: Add dining_type enum field to track sit-in vs takeaway vs both

-- 1. Add the dining_type column (if not exists)
ALTER TABLE listings ADD COLUMN IF NOT EXISTS dining_type VARCHAR(20) DEFAULT NULL;

-- 2. Populate dining_type based on restaurant/fast_food tags for listings in restaurants category
-- Takeaway: has fast_food tag, no restaurant tag
UPDATE listings 
SET dining_type = 'takeaway'
WHERE category_slug = 'restaurants'
  AND tags && ARRAY['fast_food']
  AND (tags && ARRAY['restaurant'] IS FALSE OR tags && ARRAY['restaurant'] IS NULL);

-- Dine-in: has restaurant tag, no fast_food tag
UPDATE listings 
SET dining_type = 'dine_in'
WHERE category_slug = 'restaurants'
  AND tags && ARRAY['restaurant']
  AND (tags && ARRAY['fast_food'] IS FALSE OR tags && ARRAY['fast_food'] IS NULL);

-- Both: has both restaurant and fast_food tags
UPDATE listings 
SET dining_type = 'both'
WHERE category_slug = 'restaurants'
  AND tags && ARRAY['restaurant']
  AND tags && ARRAY['fast_food'];

-- 3. For cafes, mark as dine_in (cafes don't typically have takeaway-only distinction)
UPDATE listings 
SET dining_type = 'dine_in'
WHERE category_slug = 'cafes'
  AND dining_type IS NULL;
