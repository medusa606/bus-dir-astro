-- Migration: Refactor categories and reassign listings
-- Date: 2026-04-27
-- Purpose: Split health-and-wellbeing, rename fitness-and-sports, add accommodation and retail-and-fashion

-- 1. Move sports_centre tags to sports-and-recreation (exclude yoga/pilates/massage)
UPDATE listings 
SET category_slug = 'sports-and-recreation'
WHERE tags && ARRAY['sports_centre']
  AND NOT (tags && ARRAY['yoga', 'pilates', 'massage', 'meditation', 'acupuncture', 'chiropractor', 'osteopath'])
  AND category_slug = 'health-and-wellbeing';

-- 2. Move shoes to retail-and-fashion
UPDATE listings 
SET category_slug = 'retail-and-fashion'
WHERE tags && ARRAY['shoes', 'shoe_shop', 'footwear']
  AND category_slug = 'services';

-- 3. Move clothing/fashion to retail-and-fashion
UPDATE listings 
SET category_slug = 'retail-and-fashion'
WHERE tags && ARRAY['clothing', 'fashion', 'boutique', 'apparel']
  AND category_slug = 'services';

-- 4. Move books to retail-and-fashion
UPDATE listings 
SET category_slug = 'retail-and-fashion'
WHERE tags && ARRAY['bookshop', 'books', 'stationery']
  AND category_slug = 'services';

-- 5. Move hostel/hotel/guest_house to accommodation
UPDATE listings 
SET category_slug = 'accommodation'
WHERE tags && ARRAY['hostel', 'hotel', 'guest_house', 'bed_and_breakfast', 'airbnb'];

-- 6. Move music/dance to art-and-design
UPDATE listings 
SET category_slug = 'art-and-design'
WHERE tags && ARRAY['music_school', 'music_academy', 'dance_studio', 'dance']
  AND category_slug != 'art-and-design';

-- Note: The following remains unchanged:
-- - Restaurants categorized as fast_food or restaurant stay in 'restaurants'
-- - Cafes stay in 'cafes'
-- - All other categories remain as-is
