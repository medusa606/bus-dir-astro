-- Migration: Add image_key column for manual illustration overrides
--
-- image_key stores a full public image path, e.g.:
--   /illustrations/category-slug/health-and-wellbeing/yoga-01.webp
--
-- When set, it takes priority over the automatic tag-based image selection
-- but is overridden by illustration_url (AI-generated illustrations).
--
-- Resolution order in the app:
--   illustration_url → image_key → tag-based image → image_url/photo_url

ALTER TABLE listings
ADD COLUMN IF NOT EXISTS image_key TEXT;

COMMENT ON COLUMN listings.image_key IS
    'Manual illustration override. Full public path e.g. /illustrations/category-slug/cafes/cafe-01.webp. Takes priority over automatic tag-based image selection.';
