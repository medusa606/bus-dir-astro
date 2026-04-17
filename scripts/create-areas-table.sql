-- Run this in the Supabase SQL editor to create the areas table.
-- This table controls optional hero images on area pages (e.g. /bristol/easton).

CREATE TABLE IF NOT EXISTS areas (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    city_slug           TEXT        NOT NULL,
    area_slug           TEXT        NOT NULL,
    use_hero_image      BOOLEAN     NOT NULL DEFAULT false,
    -- hero_image_url accepts either:
    --   a full Supabase Storage URL  → 'https://<project>.supabase.co/storage/v1/object/public/area-heroes/bristol-easton.webp'
    --   a local public/ path         → '/areas/bristol-easton.webp'
    -- Naming convention: {city-slug}-{area-slug}.{ext}  e.g. bristol-easton.webp, leeds-easton.webp
    -- Preferred format: .webp (best performance), .jpg/.png also supported
    hero_image_url      TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT areas_city_area_unique UNIQUE (city_slug, area_slug)
);

-- Row Level Security: allow anonymous read (same pattern as listings table)
ALTER TABLE areas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for areas"
    ON areas
    FOR SELECT
    TO anon
    USING (true);

-- Auto-update updated_at on row changes (requires the moddatetime extension)
-- If moddatetime is not enabled, remove this block and update manually.
CREATE EXTENSION IF NOT EXISTS moddatetime SCHEMA extensions;

CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON areas
    FOR EACH ROW
    EXECUTE PROCEDURE moddatetime(updated_at);

-- Example rows:
-- INSERT INTO areas (city_slug, area_slug, use_hero_image, hero_image_url)
-- VALUES
--   ('bristol', 'easton',  true,  '/areas/bristol-easton.webp'),
--   ('bristol', 'clifton', false, null),
--   ('leeds',   'easton',  true,  'https://<project>.supabase.co/storage/v1/object/public/area-heroes/leeds-easton.webp');
