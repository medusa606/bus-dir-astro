#!/usr/bin/env node
/**
 * Curated Listings Import Pipeline
 *
 * Imports enriched listing data from a CSV file into Supabase.
 * Derives category_slug from category and dining_type from tags.
 *
 * Usage:
 *   node scripts/import-curated-listings.js --input path/to/listings.csv [--dry-run]
 *
 * Env vars (see .env.example):
 *   SUPABASE_URL, SUPABASE_SERVICE_KEY
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'csv-parse/sync';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

// Category to slug mapping (14 categories total)
const CATEGORY_TO_SLUG = {
    'Cafes & Coffee': 'cafes',
    'Cafes': 'cafes',
    'Restaurants': 'restaurants',
    'Restaurant': 'restaurants',
    'Restaurants & Fast Food': 'restaurants',
    'Food & Produce': 'food-and-produce',
    'Drinks & Brewing': 'drinks-and-brewing',
    'Health & Wellbeing': 'health-and-wellbeing',
    'Craft & Makers': 'craft-and-makers',
    'Art & Design': 'art-and-design',
    'Sports & Recreation': 'sports-and-recreation',
    'Fitness & Sports': 'sports-and-recreation',
    'Home & Interiors': 'home-and-interiors',
    'Plants & Garden': 'plants-and-garden',
    'Entertainment': 'entertainment',
    'Services': 'services',
    'Accommodation': 'accommodation',
    'Retail & Fashion': 'retail-and-fashion',
};

// Fields that are safe to upsert (curated data)
const UPSERT_FIELDS = [
    'id',
    'description',
    'email',
    'phone',
    'address',
    'google_maps_url',
    'opening_hours',
    'social_facebook',
    'social_instagram',
    'social_twitter',
    'social_tiktok',
    'social_linkedin',
    'social_youtube',
    'image_category',
    'secondary_category',
    'secondary_category_slug',
    'tags',
    'category',
    'category_slug',
    'dining_type',
];

// Fields to NEVER overwrite (protected data)
const PROTECTED_FIELDS = [
    'illustration_url',
    'illustration_status',
    'illustration_generated_at',
    'add_listing_illustration',
    'latitude',
    'longitude',
    'osm_id',
    'wikidata_id',
    'scrape_date',
    'source',
    'photo_url',
    'google_summary',
    'google_rating',
    'google_review_count',
    'google_place_id',
];

// Parse CLI args
const args = process.argv.slice(2);
const inputIdx = args.indexOf('--input');
const dryRun = args.includes('--dry-run');

if (inputIdx === -1 || !args[inputIdx + 1]) {
    console.error('Usage: node scripts/import-curated-listings.js --input <path> [--dry-run]');
    process.exit(1);
}

const inputPath = args[inputIdx + 1];

if (!fs.existsSync(inputPath)) {
    console.error(`File not found: ${inputPath}`);
    process.exit(1);
}

if (!dryRun && (!SUPABASE_URL || !SUPABASE_SERVICE_KEY)) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY (required for non-dry-run mode)');
    process.exit(1);
}

const supabase = SUPABASE_URL && SUPABASE_SERVICE_KEY 
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    : null;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function deriveSlugFromCategory(category) {
    if (!category) return null;
    const slug = CATEGORY_TO_SLUG[category];
    if (!slug) {
        console.warn(`⚠️  Unknown category: "${category}"`);
        return null;
    }
    return slug;
}

function deriveDiningTypeFromTags(tags, categorySlug) {
    if (categorySlug !== 'restaurants') return null;
    if (!tags || typeof tags !== 'string') return null;
    
    let tagsArray = [];
    try {
        tagsArray = JSON.parse(tags);
    } catch {
        console.warn(`⚠️  Could not parse tags: ${tags}`);
        return null;
    }

    const hasRestaurant = tagsArray.includes('restaurant');
    const hasFastFood = tagsArray.includes('fast_food');

    if (hasRestaurant && hasFastFood) return 'both';
    if (hasFastFood) return 'takeaway';
    if (hasRestaurant) return 'dine_in';
    return null;
}

function isEnrichedRow(row) {
    // A row is enriched if at least one curated field has data
    for (const field of UPSERT_FIELDS) {
        if (field !== 'id' && field !== 'category_slug' && field !== 'dining_type') {
            if (row[field]) return true;
        }
    }
    return false;
}

function buildUpsertRow(csvRow) {
    const row = { id: csvRow.id };
    
    for (const field of UPSERT_FIELDS) {
        if (field === 'id') continue;
        const value = csvRow[field];
        
        // Only include field if it has a non-empty value
        if (value && value.trim && value.trim().length > 0) {
            // Parse JSON fields
            if (field === 'tags' && typeof value === 'string') {
                try {
                    row[field] = JSON.parse(value);
                } catch {
                    console.warn(`⚠️  Could not parse tags JSON for id ${csvRow.id}: ${value}`);
                    row[field] = value;
                }
            } else {
                row[field] = value;
            }
        } else if (value && !value.trim) {
            // Handle non-string values (numbers, booleans, etc.)
            row[field] = value;
        }
    }

    // Derive category_slug from category (safety net)
    if (csvRow.category && csvRow.category.trim()) {
        row.category_slug = deriveSlugFromCategory(csvRow.category);
    }

    // Derive dining_type from tags (restaurants only)
    if (row.category_slug === 'restaurants' && csvRow.tags) {
        row.dining_type = deriveDiningTypeFromTags(csvRow.tags, row.category_slug);
    }

    return row;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
    console.log(`📂 Reading CSV: ${inputPath}`);
    
    const fileContent = fs.readFileSync(inputPath, 'utf-8');
    const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
    });

    console.log(`✓ Parsed ${records.length} rows`);

    // Filter to enriched rows
    const enrichedRows = records.filter(isEnrichedRow);
    console.log(`✓ Found ${enrichedRows.length} enriched rows`);

    // Build upsert payload
    const upsertRows = enrichedRows.map(buildUpsertRow);

    // Log sample
    if (upsertRows.length > 0) {
        console.log('\n📋 Sample rows to upsert:');
        upsertRows.slice(0, 3).forEach((row, i) => {
            console.log(`\n  Row ${i + 1}:`);
            console.log(`    id: ${row.id}`);
            if (row.category) console.log(`    category: ${row.category}`);
            if (row.category_slug) console.log(`    category_slug: ${row.category_slug}`);
            if (row.dining_type) console.log(`    dining_type: ${row.dining_type}`);
            if (row.description) console.log(`    description: ${row.description.substring(0, 50)}...`);
        });
    }

    if (dryRun) {
        console.log('\n🏃 DRY RUN MODE - No DB writes');
        console.log(`Would upsert ${upsertRows.length} rows`);
    }

    // Log summary (for both dry-run and real execution)
    console.log(`\n📊 Import Summary:`);
    console.log(`  Total rows in CSV: ${records.length}`);
    console.log(`  Enriched rows: ${enrichedRows.length}`);
    console.log(`  To upsert: ${upsertRows.length}`);
    
    // Breakdown by category
    const categoryCounts = {};
    upsertRows.forEach(row => {
        const cat = row.category_slug || 'unknown';
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
    
    console.log(`\n📈 By Category:`);
    Object.entries(categoryCounts)
        .sort(([, a], [, b]) => b - a)
        .forEach(([cat, count]) => {
            console.log(`  ${cat}: ${count}`);
        });

    if (dryRun) {
        console.log('');
        return;
    }

    if (!supabase) {
        console.error('\n❌ Cannot proceed: Supabase client not initialized');
        process.exit(1);
    }

    // Update existing rows in Supabase (don't insert, only update)
    console.log(`\n⏳ Updating ${upsertRows.length} rows...`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const row of upsertRows) {
        const { error } = await supabase
            .from('listings')
            .update(row)
            .eq('id', row.id);
        
        if (error) {
            console.error(`❌ Error updating id ${row.id}:`, error.message);
            errorCount++;
        } else {
            successCount++;
        }
    }

    if (errorCount > 0) {
        console.error(`\n⚠️  Completed with errors: ${successCount} succeeded, ${errorCount} failed`);
        process.exit(1);
    }

    console.log(`✅ Success! Updated ${successCount} rows`);
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
