-- Add optional hero_image_url column to landing_pages.
-- Run this once in the Supabase SQL editor.
-- If set, this overrides the auto-selected listing photo used as the hero backdrop.

ALTER TABLE landing_pages
  ADD COLUMN IF NOT EXISTS hero_image_url TEXT DEFAULT NULL;
