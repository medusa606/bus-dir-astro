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
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
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

// ── Replicated matching logic (mirrors categoryImages.js) ────────────────────
// Keep in sync with TAG_TO_IMAGE_RULES in src/utils/categoryImages.js

const TAG_TO_IMAGE_RULES = [
    { tags: ['yoga', 'pilates', 'meditation', 'wellness'],                              image: '/illustrations/category-slug/health-and-wellbeing/yoga-01.webp' },
    { tags: ['nail_salon', 'nails', 'manicure', 'pedicure'],                           image: '/illustrations/category-slug/health-and-wellbeing/nail-salon-01.webp' },
    { tags: ['barbershop', 'barber'],                                                   image: '/illustrations/category-slug/health-and-wellbeing/barbershop-01.webp' },
    { tags: ['hairdresser', 'hair_salon', 'salon'],                                     image: '/illustrations/category-slug/health-and-wellbeing/hairdresser-01.webp' },
    { tags: ['cheesemonger', 'cheese'],                                                 image: '/illustrations/category-slug/food-and-produce/cheesemonger-01.webp' },
    { tags: ['deli', 'delicatessen'],                                                   image: '/illustrations/category-slug/food-and-produce/deli.webp' },
    { tags: ['bakery', 'cake', 'donut', 'flapjacks'],                                  image: '/illustrations/category-slug/food-and-produce/bakery-01.webp' },
    { tags: ['supermarket'],                                                            image: '/illustrations/category-slug/food-and-produce/supermarket-01.webp' },
    { tags: ['corner_shop', 'convenience_store'],                                       image: '/illustrations/category-slug/food-and-produce/corner-shop-01.webp' },
    { tags: ['wine_bar', 'wine', 'cocktail_bar', 'cellar'],                            image: '/illustrations/category-slug/drinks-and-brewing/wine-bar-01.webp' },
    { tags: ['pub', 'bar', 'tavern', 'brewery', 'taproom'],                            image: '/illustrations/category-slug/drinks-and-brewing/pub-01.webp' },
    { tags: ['cafe', 'coffee_shop', 'coffee', 'tea', 'bubble_tea', 'brunch', 'juice'], image: '/illustrations/category-slug/cafes/cafe-01.webp' },
    { tags: ['ice_cream', 'frozen_yogurt', 'dessert'],                                 image: '/illustrations/category-slug/restaurants/ice-cream-01.webp' },
    { tags: ['restaurant', 'fast_food', 'takeaway'],                                   image: '/illustrations/category-slug/restaurants/restaurant-01.webp' },
    { tags: ['golf', 'golf_course'],                                                   image: '/illustrations/category-slug/fitness-and-sports/golf-course-01.webp' },
    { tags: ['swimming', 'pool', 'swimming_pool'],                                     image: '/illustrations/category-slug/fitness-and-sports/swimming-pool-01.webp' },
    { tags: ['gym', 'fitness', 'crossfit', 'personal_trainer'],                        image: '/illustrations/category-slug/fitness-and-sports/fitness-studio-01.webp' },
    { tags: ['theatre', 'theater', 'cinema'],                                          image: '/illustrations/category-slug/entertainment/theater-01.webp' },
    { tags: ['live_music', 'music_venue'],                                              image: '/illustrations/category-slug/entertainment/live-music-01.webp' },
    { tags: ['nightclub', 'club'],                                                     image: '/illustrations/category-slug/entertainment/nightclub-01.webp' },
    { tags: ['florist', 'flowers', 'floristry'],                                       image: '/illustrations/category-slug/plants-and-garden/florist-01.webp' },
    { tags: ['garden_centre', 'nursery', 'garden'],                                    image: '/illustrations/category-slug/plants-and-garden/garden-centre-01.webp' },
    { tags: ['dry_cleaning'],                                                           image: '/illustrations/category-slug/services/dry-cleaning-01.webp' },
    { tags: ['tailor', 'alterations'],                                                 image: '/illustrations/category-slug/services/tailors-01.webp' },
    { tags: ['launderette', 'laundromat', 'laundrette'],                               image: '/illustrations/category-slug/services/launderette-01.webp' },
    { tags: ['pottery', 'ceramics'],                                                   image: '/illustrations/category-slug/craft-and-makers/pottery-01.webp' },
    { tags: ['weaving', 'textiles', 'knitting', 'sewing'],                             image: '/illustrations/category-slug/craft-and-makers/weaver-01.webp' },
    { tags: ['arts_centre', 'gallery', 'studio'],                                      image: '/illustrations/category-slug/art-and-design/gallery-01.webp' },
    { tags: ['painter', 'artist'],                                                     image: '/illustrations/category-slug/art-and-design/painter-01.webp' },
    { tags: ['interiors', 'furniture', 'home_goods', 'homeware'],                      image: '/illustrations/category-slug/home-and-interiors/home-01.webp' },
];

function normaliseTag(tag) {
    return tag.toLowerCase().replace(/[_-]/g, '');
}

function getTagBasedImage(tags, categorySlug) {
    if (Array.isArray(tags) && tags.length > 0) {
        const normalisedListingTags = tags.map(normaliseTag);
        for (const rule of TAG_TO_IMAGE_RULES) {
            const normalisedRuleTags = rule.tags.map(normaliseTag);
            if (normalisedListingTags.some(lt => normalisedRuleTags.includes(lt))) {
                return { image: rule.image, source: 'tag' };
            }
        }
    }
    return { image: `(category folder: ${categorySlug})`, source: 'fallback' };
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
            const { image, source } = getTagBasedImage(listing.tags, listing.category_slug);
            if (source === 'tag') tagMatched++; else fallback++;
            rows.push({
                name: listing.name?.slice(0, 30).padEnd(30),
                category: (listing.category_slug || '').slice(0, 22).padEnd(22),
                tags: (listing.tags || []).join(', ').slice(0, 40).padEnd(40),
                image: image.split('/').pop(),
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
        const { image, source } = getTagBasedImage(listing.tags, listing.category_slug);
        fallback++;
        rows.push({
            name: (listing.name || '').slice(0, 30).padEnd(30),
            category: (listing.category_slug || '').slice(0, 22).padEnd(22),
            tags: '(no tags)'.padEnd(40),
            image: image.split('/').pop(),
            source,
        });
    }

    const total = tagMatched + fallback;

    console.log('\n' + '─'.repeat(130));
    console.log(
        'NAME'.padEnd(32) +
        'CATEGORY'.padEnd(24) +
        'TAGS (truncated)'.padEnd(42) +
        'ASSIGNED IMAGE'.padEnd(28) +
        'SOURCE'
    );
    console.log('─'.repeat(130));

    for (const r of rows) {
        const sourceLabel = r.source === 'tag' ? '✓ tag' : '  fallback';
        console.log(`${r.name}  ${r.category}  ${r.tags}  ${r.image.padEnd(26)}  ${sourceLabel}`);
    }

    console.log('─'.repeat(130));
    console.log(`\nTotal sampled: ${total}  |  Tag-matched: ${tagMatched} (${Math.round(tagMatched / total * 100)}%)  |  Fallback: ${fallback} (${Math.round(fallback / total * 100)}%)\n`);
}

run();
