-- Landing pages table for curator-editable editorial content.
-- Run this in the Supabase SQL editor before running seed-landing-pages.js.

CREATE TABLE IF NOT EXISTS landing_pages (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    city        TEXT        NOT NULL,
    area        TEXT,                              -- NULL for city-wide pages
    topic       TEXT        NOT NULL,
    topic_type  TEXT        NOT NULL CHECK (topic_type IN ('category', 'area', 'tag', 'sub_category')),
    title       TEXT        NOT NULL,
    seo_title   TEXT        NOT NULL,
    description TEXT        NOT NULL DEFAULT '',
    intro       TEXT        NOT NULL DEFAULT '',
    -- Each element: { heading: string, body: string, image_url?: string }
    sections    JSONB       NOT NULL DEFAULT '[]'::jsonb,
    -- Ordered list of listing UUIDs to pin to editorial sections.
    -- Falls back to auto-ranked top picks if empty.
    featured_ids TEXT[]     NOT NULL DEFAULT '{}',
    status      TEXT        NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- One page per (city, area, topic) combination.
    -- NB: two rows with area=NULL and different topics are distinct (NULL ≠ NULL in PG unique).
    CONSTRAINT landing_pages_city_area_topic_unique UNIQUE NULLS NOT DISTINCT (city, area, topic)
);

-- Auto-update updated_at on every write
CREATE OR REPLACE FUNCTION fn_landing_pages_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_landing_pages_updated_at ON landing_pages;
CREATE TRIGGER trg_landing_pages_updated_at
    BEFORE UPDATE ON landing_pages
    FOR EACH ROW EXECUTE FUNCTION fn_landing_pages_updated_at();

-- Row Level Security
ALTER TABLE landing_pages ENABLE ROW LEVEL SECURITY;

-- Astro build (anon key) can read published pages
CREATE POLICY "Public read published landing pages"
    ON landing_pages FOR SELECT TO anon
    USING (status = 'published');

-- Authenticated curators get full CRUD
CREATE POLICY "Authenticated full access landing pages"
    ON landing_pages FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);
