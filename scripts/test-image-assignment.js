/**
 * test-image-assignment.js
 *
 * Tests the tag-based image assignment logic against live Supabase data.
 * Run with: node scripts/test-image-assignment.js
 *
 * Requires SUPABASE_URL and SUPABASE_SERVICE_KEY (or SUPABASE_ANON_KEY)
 * to be set in your environment or a .env file at the project root.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Load .env manually (no dotenv dependency required) ────────────────────────
function loadEnv() {
    try {
        const envPath = resolve(__dirname, '../.env');
        const lines = readFileSync(envPath, 'utf8').split('\n');
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;
            const [key, ...rest] = trimmed.split('=');
            if (key && !(key in process.env)) {
                process.env[key.trim()] = rest.join('=').trim();
            }
        }
    } catch {
        // No .env file — rely on environment variables already set
    }
}
loadEnv();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY (or SUPABASE_ANON_KEY) must be set.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Build typeImageMap from the actual illustration files on disk ─────────────
// Mirrors the import.meta.glob + typeImageMap logic in categoryImages.js.
function buildTypeImageMap() {
    const map = {};
    const base = resolve(__dirname, '../public/illustrations/category-slug');
    let folders;
    try { folders = readdirSync(base, { withFileTypes: true }).filter(d => d.isDirectory()); }
    catch { return map; }

    for (const folder of folders) {
        const folderPath = join(base, folder.name);
        let files;
        try { files = readdirSync(folderPath); } catch { continue; }
        for (const filename of files) {
            if (!/\.(webp|png)$/i.test(filename)) continue;
            const stem = filename.replace(/\.[^.]+$/, '');
            const prefixMatch = stem.match(/^(.*)-\d+$/);
            const namePrefix = prefixMatch ? prefixMatch[1] : stem;
            const key = `${folder.name}/${namePrefix}`;
            const publicUrl = `/illustrations/category-slug/${folder.name}/${filename}`;
            if (!map[key]) map[key] = [];
            map[key].push(publicUrl);
        }
    }
    return map;
}

const typeImageMap = buildTypeImageMap();

// ── Replicated matching logic (mirrors categoryImages.js) ────────────────────
// Keep in sync with TAG_TO_IMAGE_RULES in src/utils/categoryImages.js

const TAG_TO_IMAGE_RULES = [
    { tags: ['dentist', 'dental'],                                                     prefix: 'health-and-wellbeing/dentist' },
    { tags: ['pharmacy', 'chemist', 'dispensary'],                                     prefix: 'health-and-wellbeing/pharmacy' },
    { tags: ['yoga', 'pilates', 'meditation', 'wellness'],                              prefix: 'health-and-wellbeing/yoga' },
    { tags: ['nail_salon', 'nails', 'manicure', 'pedicure'],                           prefix: 'health-and-wellbeing/nail-salon' },
    { tags: ['barbershop', 'barber'],                                                   prefix: 'health-and-wellbeing/barbershop' },
    { tags: ['hairdresser', 'hair_salon', 'salon'],                                     prefix: 'health-and-wellbeing/hairdresser' },
    { tags: ['cheesemonger', 'cheese'],                                                 prefix: 'food-and-produce/cheesemonger' },
    { tags: ['deli', 'delicatessen'],                                                   prefix: 'food-and-produce/deli' },
    { tags: ['sweet_shop', 'sweets', 'confectionery', 'candy'],                        prefix: 'food-and-produce/sweet-shop' },
    { tags: ['bakery', 'cake', 'donut', 'flapjacks'],                                  prefix: 'food-and-produce/bakery' },
    { tags: ['supermarket'],                                                            prefix: 'food-and-produce/supermarket' },
    { tags: ['greengrocer', 'produce', 'veg', 'vegetables', 'fruit'],                  prefix: 'food-and-produce/greengrocer' },
    { tags: ['corner_shop', 'convenience_store'],                                       prefix: 'food-and-produce/corner-shop' },
    { tags: ['wine_bar', 'wine', 'cocktail_bar', 'cellar'],                            prefix: 'drinks-and-brewing/wine-bar' },
    { tags: ['brewery', 'microbrewery'],                                               prefix: 'drinks-and-brewing/brewery' },
    { tags: ['pub', 'bar', 'tavern', 'taproom'],                                       prefix: 'drinks-and-brewing/pub' },
    { tags: ['cafe', 'coffee_shop', 'coffee', 'tea', 'bubble_tea', 'brunch', 'juice'], prefix: 'cafes/cafe' },
    { tags: ['ice_cream', 'frozen_yogurt', 'dessert'],                                 prefix: 'restaurants/ice-cream' },
    { tags: ['restaurant', 'fast_food', 'takeaway'],                                   prefix: 'restaurants/restaurant' },
    { tags: ['golf', 'golf_course'],                                                   prefix: 'fitness-and-sports/golf-course' },
    { tags: ['swimming', 'pool', 'swimming_pool'],                                     prefix: 'fitness-and-sports/swimming-pool' },
    { tags: ['gym', 'fitness', 'crossfit', 'personal_trainer'],                        prefix: 'fitness-and-sports/fitness-studio' },
    { tags: ['cinema'],                                                                prefix: 'entertainment/cinema' },
    { tags: ['theatre', 'theater'],                                                    prefix: 'entertainment/theater' },
    { tags: ['live_music', 'music_venue'],                                              prefix: 'entertainment/live-music' },
    { tags: ['nightclub', 'club'],                                                     prefix: 'entertainment/nightclub' },
    { tags: ['florist', 'flowers', 'floristry'],                                       prefix: 'plants-and-garden/florist' },
    { tags: ['garden_centre', 'nursery', 'garden'],                                    prefix: 'plants-and-garden/garden-centre' },
    { tags: ['landscaping', 'landscaper', 'groundskeeper', 'lawn'],                   prefix: 'plants-and-garden/landscaping' },
    { tags: ['shoe_shop', 'shoes', 'footwear', 'cobbler'],                             prefix: 'services/shoe-shop' },
    { tags: ['charity_shop', 'charity', 'thrift'],                                     prefix: 'services/charity-shop' },
    { tags: ['dry_cleaning'],                                                           prefix: 'services/dry-cleaning' },
    { tags: ['tailor', 'alterations'],                                                 prefix: 'services/tailors' },
    { tags: ['launderette', 'laundromat', 'aundrette'],                               prefix: 'services/launderette' },
    { tags: ['pottery', 'ceramics'],                                                   prefix: 'craft-and-makers/pottery' },
    { tags: ['weaving', 'textiles', 'knitting', 'sewing'],                             prefix: 'craft-and-makers/weaver' },
    { tags: ['photography', 'photographer', 'photography_studio'],                     prefix: 'art-and-design/photography-studio' },
    { tags: ['arts_centre', 'gallery', 'studio'],                                      prefix: 'art-and-design/gallery' },
    { tags: ['painter', 'artist'],                                                     prefix: 'art-and-design/painter' },
    { tags: ['antiques', 'vintage', 'secondhand'],                                     prefix: 'home-and-interiors/antiques' },
    { tags: ['carpet', 'carpet_shop', 'rugs', 'flooring'],                             prefix: 'home-and-interiors/carpet-shop' },
    { tags: ['lighting', 'lighting_shop', 'lamps'],                                    prefix: 'home-and-interiors/lighting-shop' },
    { tags: ['paint_supplies', 'paint_shop', 'decorating'],                            prefix: 'home-and-interiors/paint-supplies' },
    { tags: ['tile_shop', 'tiles', 'tiling'],                                          prefix: 'home-and-interiors/tile-shop' },
    { tags: ['sofa', 'sofa_shop', 'sofas', 'couch'],                                   prefix: 'home-and-interiors/sofa-shop' },
    { tags: ['interiors', 'furniture', 'home_goods', 'homeware'],                      prefix: 'home-and-interiors/home' },
];

function normaliseTag(tag) {
    return tag.toLowerCase().replace(/[_-]/g, '');
}

function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
    }
    return hash;
}

function getTagBasedImage(tags, categorySlug, businessSlug) {
    if (Array.isArray(tags) && tags.length > 0) {
        const normalisedListingTags = tags.map(normaliseTag);
        for (const rule of TAG_TO_IMAGE_RULES) {
            const normalisedRuleTags = rule.tags.map(normaliseTag);
            if (normalisedListingTags.some(lt => normalisedRuleTags.includes(lt))) {
                const variants = typeImageMap[rule.prefix];
                if (variants && variants.length > 0) {
                    const index = simpleHash(businessSlug || rule.prefix) % variants.length;
                    return { image: variants[index], variantCount: variants.length, source: 'tag' };
                }
                // prefix exists in rules but no files on disk yet
                return { image: `(missing: ${rule.prefix})`, variantCount: 0, source: 'tag-missing' };
            }
        }
    }
    return { image: `(category folder: ${categorySlug})`, variantCount: 0, source: 'fallback' };
}

// ── Fetch & report ────────────────────────────────────────────────────────────

const SAMPLE_SIZE = 15; // listings per category
const TOP_CATEGORIES = [
    'health-and-wellbeing',
    'restaurants',
    'cafes',
    'food-and-produce',
    'drinks-and-brewing',
];

async function run() {
    let tagMatched = 0;
    let fallback = 0;
    const rows = [];

    for (const category of TOP_CATEGORIES) {
        const { data, error } = await supabase
            .from('listings')
            .select('name, category_slug, tags')
            .eq('category_slug', category)
            .not('tags', 'is', null)
            .limit(SAMPLE_SIZE);

        if (error) {
            console.error(`Error fetching ${category}:`, error.message);
            continue;
        }

        for (const listing of data || []) {
            const { image, variantCount, source } = getTagBasedImage(listing.tags, listing.category_slug, listing.business_slug);
            if (source === 'tag') tagMatched++; else fallback++;
            rows.push({
                name: listing.name?.slice(0, 30).padEnd(30),
                category: (listing.category_slug || '').slice(0, 22).padEnd(22),
                tags: (listing.tags || []).join(', ').slice(0, 40).padEnd(40),
                image: image.split('/').pop(),
                variants: variantCount,
                source,
            });
        }
    }

    // Also fetch a sample with no tags to confirm fallback behaviour
    const { data: noTagListings } = await supabase
        .from('listings')
        .select('name, category_slug, tags')
        .is('tags', null)
        .limit(5);

    for (const listing of noTagListings || []) {
        const { image, variantCount, source } = getTagBasedImage(listing.tags, listing.category_slug, listing.business_slug);
        fallback++;
        rows.push({
            name: (listing.name || '').slice(0, 30).padEnd(30),
            category: (listing.category_slug || '').slice(0, 22).padEnd(22),
            tags: '(no tags)'.padEnd(40),
            image: image.split('/').pop(),
            variants: variantCount,
            source,
        });
    }

    const total = tagMatched + fallback;

    console.log('\n' + '─'.repeat(140));
    console.log(
        'NAME'.padEnd(32) +
        'CATEGORY'.padEnd(24) +
        'TAGS (truncated)'.padEnd(42) +
        'ASSIGNED IMAGE'.padEnd(28) +
        'VARIANTS'.padEnd(10) +
        'SOURCE'
    );
    console.log('─'.repeat(140));

    for (const r of rows) {
        const sourceLabel = r.source === 'tag' ? '✓ tag' : r.source === 'tag-missing' ? '⚠ missing' : '  fallback';
        console.log(`${r.name}  ${r.category}  ${r.tags}  ${r.image.padEnd(26)}  ${String(r.variants).padEnd(8)}  ${sourceLabel}`);
    }

    console.log('─'.repeat(140));
    console.log(`\nTotal sampled: ${total}  |  Tag-matched: ${tagMatched} (${Math.round(tagMatched / total * 100)}%)  |  Fallback: ${fallback} (${Math.round(fallback / total * 100)}%)\n`);
}

run();
