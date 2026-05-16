-- Precomputed relation columns for listings
-- Run once in Supabase SQL editor, then run scripts/precompute-relations.js to populate

ALTER TABLE listings
    ADD COLUMN IF NOT EXISTS nearby_ids   UUID[]  DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS nearby_distances INT[] DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS similar_ids  UUID[]  DEFAULT NULL;

-- Indexes so .in('id', [...]) lookups stay fast on the UUID PK (already indexed, no extra needed)
-- Optional: GIN index if you ever query the arrays from Postgres side
-- CREATE INDEX IF NOT EXISTS idx_listings_nearby_ids  ON listings USING GIN (nearby_ids);
-- CREATE INDEX IF NOT EXISTS idx_listings_similar_ids ON listings USING GIN (similar_ids);
