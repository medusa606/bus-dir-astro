#!/usr/bin/env node
/**
 * seed-landing-pages.js
 *
 * Reads all .md files from src/content/landing/, parses their YAML frontmatter,
 * and upserts them into the Supabase landing_pages table.
 *
 * Run ONCE after creating the landing_pages table (see scripts/create-landing-pages-table.sql).
 * After confirming all 12 rows are in the DB, you can delete the .md files from the repo.
 *
 * Usage:
 *   node scripts/seed-landing-pages.js
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LANDING_DIR = path.resolve(__dirname, '../src/content/landing');

// Use the service key so we can insert regardless of RLS (seed operation only)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Parse YAML frontmatter from a .md file.
 * Returns the parsed frontmatter object.
 */
function parseFrontmatter(filePath) {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!match) throw new Error(`No frontmatter found in ${filePath}`);
    return yaml.load(match[1]);
}

async function seed() {
    const files = fs.readdirSync(LANDING_DIR)
        .filter(f => f.endsWith('.md'))
        .sort();

    console.log(`📄 Found ${files.length} landing page files\n`);

    const rows = [];
    for (const file of files) {
        const filePath = path.join(LANDING_DIR, file);
        const data = parseFrontmatter(filePath);

        rows.push({
            city:         data.city,
            area:         data.area ?? null,
            topic:        data.topic,
            topic_type:   data.topicType,
            title:        data.title,
            seo_title:    data.seoTitle,
            description:  data.description ?? '',
            intro:        data.intro ?? '',
            // Sections from .md have {heading, body}; image_url defaults to null
            sections:     (data.sections || []).map(s => ({
                heading:   s.heading,
                body:      s.body,
                image_url: s.image_url ?? null,
            })),
            featured_ids: data.featuredIds ?? [],
            status:       'published',
        });

        const key = data.area
            ? `${data.city}--${data.area}--${data.topic}`
            : `${data.city}--${data.topic}`;
        console.log(`  ✓ Parsed ${key}`);
    }

    console.log(`\n⬆️  Upserting ${rows.length} rows into landing_pages…`);

    const { data: inserted, error } = await supabase
        .from('landing_pages')
        .upsert(rows, {
            onConflict: 'city,area,topic',
            ignoreDuplicates: false,
        })
        .select('id, city, area, topic, status');

    if (error) {
        console.error('❌ Upsert failed:', error.message);
        process.exit(1);
    }

    console.log(`\n✅ Done — ${inserted?.length ?? rows.length} rows upserted:\n`);
    for (const row of (inserted || [])) {
        const key = row.area ? `${row.city}--${row.area}--${row.topic}` : `${row.city}--${row.topic}`;
        console.log(`  ${row.id}  ${key}  [${row.status}]`);
    }
}

seed().catch(err => {
    console.error('❌ Unexpected error:', err);
    process.exit(1);
});
