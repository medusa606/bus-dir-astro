-- Fix: No12 Easton Cafe is incorrectly categorised as 'restaurants'
-- It should be 'cafes' — its name, tags and editorial treatment all confirm this.
UPDATE listings
SET
    category_slug = 'cafes',
    category = 'Cafes & Coffee'
WHERE business_slug = 'no12-easton-cafe';

-- Verify
SELECT name, category, category_slug, ranking_tier
FROM listings
WHERE business_slug = 'no12-easton-cafe';
