-- Migration: add slug column to landing_pages
-- Run this in the Supabase SQL editor BEFORE deploying the updated code.
--
-- The slug is the URL segment used to reach the page, e.g.
--   /bristol/best-breakfast        → slug = 'best-breakfast'
--   /bristol/easton-best-beer      → slug = 'easton-best-beer'

-- 1. Add the column (nullable first so we can populate existing rows)
ALTER TABLE landing_pages ADD COLUMN IF NOT EXISTS slug text;

-- 2. Populate existing rows with a sensible default:
--    area pages:  {area}-best-{topic}   e.g. easton-best-beer
--    city pages:  best-{topic}          e.g. best-breakfast
UPDATE landing_pages
SET slug = CASE
    WHEN area IS NOT NULL THEN area || '-best-' || topic
    ELSE 'best-' || topic
END
WHERE slug IS NULL;

-- 3. Enforce NOT NULL and uniqueness per city
ALTER TABLE landing_pages ALTER COLUMN slug SET NOT NULL;
ALTER TABLE landing_pages ADD CONSTRAINT landing_pages_city_slug_key UNIQUE (city, slug);

-- 4. Index for fast lookup by the new route
CREATE INDEX IF NOT EXISTS landing_pages_city_slug_idx ON landing_pages (city, slug);
