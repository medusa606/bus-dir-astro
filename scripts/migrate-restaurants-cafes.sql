-- Migration: Split 'restaurants-and-cafes' into 2 categories:
-- cafes, restaurants (fast food / takeaways included in restaurants)
--
-- Step 1: Reset all current 'cafes' rows to 'restaurants' as the default baseline
UPDATE listings
SET
    category_slug = 'restaurants',
    category = 'Restaurants & Fast Food'
WHERE category_slug = 'cafes';

-- Step 2: Merge any 'fast-food' rows back into 'restaurants'
UPDATE listings
SET
    category_slug = 'restaurants',
    category = 'Restaurants & Fast Food'
WHERE category_slug = 'fast-food';

-- Step 3: Move cafe / coffee listings to 'cafes'
UPDATE listings
SET
    category_slug = 'cafes',
    category = 'Cafes & Coffee'
WHERE
    category_slug = 'restaurants'
    AND tags && ARRAY['cafe','coffee_shop','coffee','tea','bubble_tea','bakery',
                      'cake','juice','dessert','ice_cream','brunch','frozen_yogurt',
                      'donut','flapjacks'];

-- Verification: run this after to confirm expected split
SELECT string_agg(category_slug || ' (' || count::text || ')', E'\n' ORDER BY count DESC) AS result
FROM (
    SELECT category_slug, COUNT(*) AS count
    FROM listings
    WHERE category_slug IN ('restaurants', 'cafes', 'fast-food', 'restaurants-and-cafes')
    GROUP BY category_slug
) t;
