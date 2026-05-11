-- Add emoji column to landing_pages table.
-- Stores a single emoji character or a relative public/ image path (e.g. /photos/foo.jpg).
-- Run in the Supabase SQL editor.

ALTER TABLE landing_pages ADD COLUMN IF NOT EXISTS emoji TEXT;
