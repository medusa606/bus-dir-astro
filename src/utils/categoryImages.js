import { normaliseCategory } from './helpers.js';

/**
 * Priority-ordered tag → illustration mapping.
 * The first matching rule wins, so more-specific types must appear before
 * broader categories (e.g. cheesemonger before corner-shop, wine-bar before pub).
 *
 * Each rule's `prefix` is '{folder}/{name-stem}' — the folder under
 * category-slug/ and the filename without its trailing -NN numbering.
 * All files sharing that prefix are treated as variants and one is chosen
 * deterministically per listing, restoring the multi-variant behaviour.
 *
 * Tags are matched case-insensitively with underscores and hyphens treated as
 * equivalent (see normaliseTag below).
 */
export const TAG_TO_IMAGE_RULES = [
    // ── Health & Wellbeing ────────────────────────────────────────────────
    { tags: ['yoga', 'pilates', 'meditation', 'wellness'],                              prefix: 'health-and-wellbeing/yoga' },
    { tags: ['nail_salon', 'nails', 'manicure', 'pedicure'],                           prefix: 'health-and-wellbeing/nail-salon' },
    { tags: ['barbershop', 'barber'],                                                   prefix: 'health-and-wellbeing/barbershop' },
    { tags: ['hairdresser', 'hair_salon', 'salon'],                                     prefix: 'health-and-wellbeing/hairdresser' },

    // ── Food & Produce ────────────────────────────────────────────────────
    { tags: ['cheesemonger', 'cheese'],                                                 prefix: 'food-and-produce/cheesemonger' },
    { tags: ['deli', 'delicatessen'],                                                   prefix: 'food-and-produce/deli' },
    { tags: ['bakery', 'cake', 'donut', 'flapjacks'],                                  prefix: 'food-and-produce/bakery' },
    { tags: ['supermarket'],                                                            prefix: 'food-and-produce/supermarket' },
    { tags: ['corner_shop', 'convenience_store'],                                       prefix: 'food-and-produce/corner-shop' },

    // ── Drinks & Brewing ──────────────────────────────────────────────────
    { tags: ['wine_bar', 'wine', 'cocktail_bar', 'cellar'],                            prefix: 'drinks-and-brewing/wine-bar' },
    { tags: ['pub', 'bar', 'tavern', 'brewery', 'taproom'],                            prefix: 'drinks-and-brewing/pub' },

    // ── Cafes ─────────────────────────────────────────────────────────────
    { tags: ['cafe', 'coffee_shop', 'coffee', 'tea', 'bubble_tea', 'brunch', 'juice'], prefix: 'cafes/cafe' },

    // ── Restaurants ───────────────────────────────────────────────────────
    { tags: ['ice_cream', 'frozen_yogurt', 'dessert'],                                 prefix: 'restaurants/ice-cream' },
    { tags: ['restaurant', 'fast_food', 'takeaway'],                                   prefix: 'restaurants/restaurant' },

    // ── Fitness & Sports ──────────────────────────────────────────────────
    { tags: ['golf', 'golf_course'],                                                   prefix: 'fitness-and-sports/golf-course' },
    { tags: ['swimming', 'pool', 'swimming_pool'],                                     prefix: 'fitness-and-sports/swimming-pool' },
    { tags: ['gym', 'fitness', 'crossfit', 'personal_trainer'],                        prefix: 'fitness-and-sports/fitness-studio' },

    // ── Entertainment ─────────────────────────────────────────────────────
    { tags: ['theatre', 'theater', 'cinema'],                                          prefix: 'entertainment/theater' },
    { tags: ['live_music', 'music_venue'],                                              prefix: 'entertainment/live-music' },
    { tags: ['nightclub', 'club'],                                                     prefix: 'entertainment/nightclub' },

    // ── Plants & Garden ───────────────────────────────────────────────────
    { tags: ['florist', 'flowers', 'floristry'],                                       prefix: 'plants-and-garden/florist' },
    { tags: ['garden_centre', 'nursery', 'garden'],                                    prefix: 'plants-and-garden/garden-centre' },

    // ── Services ──────────────────────────────────────────────────────────
    { tags: ['dry_cleaning'],                                                           prefix: 'services/dry-cleaning' },
    { tags: ['tailor', 'alterations'],                                                 prefix: 'services/tailors' },
    { tags: ['launderette', 'laundromat', 'laundrette'],                               prefix: 'services/launderette' },

    // ── Craft & Makers ────────────────────────────────────────────────────
    { tags: ['pottery', 'ceramics'],                                                   prefix: 'craft-and-makers/pottery' },
    { tags: ['weaving', 'textiles', 'knitting', 'sewing'],                             prefix: 'craft-and-makers/weaver' },

    // ── Art & Design ──────────────────────────────────────────────────────
    { tags: ['arts_centre', 'gallery', 'studio'],                                      prefix: 'art-and-design/gallery' },
    { tags: ['painter', 'artist'],                                                     prefix: 'art-and-design/painter' },

    // ── Home & Interiors ──────────────────────────────────────────────────
    { tags: ['interiors', 'furniture', 'home_goods', 'homeware'],                      prefix: 'home-and-interiors/home' },
];

/** Normalise a tag for comparison: lowercase, underscores and hyphens stripped. */
function normaliseTag(tag) {
    return tag.toLowerCase().replace(/[_-]/g, '');
}

/**
 * Return the best-matching illustration URL for a listing based on its tags.
 * Uses TAG_TO_IMAGE_RULES in priority order — first match wins.
 * When a rule matches, picks deterministically from all variant files sharing
 * that rule's prefix (e.g. pub-01, pub-02 are both candidates for prefix 'pub').
 * Falls back to getCategoryFallbackImage if no tag matches.
 *
 * @param {string[]|null} tags             - e.g. ['cafe', 'bakery']
 * @param {string}        categorySlug     - e.g. 'cafes'
 * @param {string}        deterministicKey - e.g. listing.business_slug
 * @returns {string|null}
 */
export function getTagBasedImage(tags, categorySlug, deterministicKey) {
    if (Array.isArray(tags) && tags.length > 0) {
        const normalisedListingTags = tags.map(normaliseTag);
        for (const rule of TAG_TO_IMAGE_RULES) {
            const normalisedRuleTags = rule.tags.map(normaliseTag);
            if (normalisedListingTags.some(lt => normalisedRuleTags.includes(lt))) {
                const variants = typeImageMap[rule.prefix];
                if (variants && variants.length > 0) {
                    const index = simpleHash(deterministicKey || rule.prefix) % variants.length;
                    return variants[index];
                }
            }
        }
    }
    return getCategoryFallbackImage(categorySlug, deterministicKey);
}

// Discover all category illustration webps at build time.
// Keys are like: /public/illustrations/category-slug/cafes/cafe-01.webp
const allImages = import.meta.glob(
    '/public/illustrations/category-slug/**/*.webp',
    { eager: false, query: '?url', import: 'default' }
);

// Build a map: normalisedCategorySlug → ['/illustrations/.../file.webp', ...]
// We only need the public URL path, not the imported module.
const categoryImageMap = {};

for (const path of Object.keys(allImages)) {
    // path: /public/illustrations/category-slug/{slug}/file.webp
    const parts = path.split('/');
    // parts[0]='', [1]='public', [2]='illustrations', [3]='category-slug', [4]=slug, [5]=file
    const slug = parts[4];
    if (!slug) continue;
    const normSlug = normaliseCategory(slug);
    // Convert to public URL by stripping the leading /public
    const publicUrl = path.replace(/^\/public/, '');
    if (!categoryImageMap[normSlug]) categoryImageMap[normSlug] = [];
    categoryImageMap[normSlug].push(publicUrl);
}

// Build a map: '{folder}/{name-prefix}' → ['/illustrations/.../file.webp', ...]
// name-prefix is the filename stem with its trailing -NN number stripped,
// so cafe-01.webp, cafe-02.webp, cafe-03.webp all group under 'cafes/cafe'.
const typeImageMap = {};

for (const path of Object.keys(allImages)) {
    const parts = path.split('/');
    const folder = parts[4];
    const filename = parts[5];
    if (!folder || !filename) continue;
    const stem = filename.replace(/\.[^.]+$/, ''); // strip extension
    const prefixMatch = stem.match(/^(.*)-\d+$/);
    const namePrefix = prefixMatch ? prefixMatch[1] : stem;
    const key = `${folder}/${namePrefix}`;
    const publicUrl = path.replace(/^\/public/, '');
    if (!typeImageMap[key]) typeImageMap[key] = [];
    typeImageMap[key].push(publicUrl);
}

/**
 * Simple deterministic hash to consistently pick the same image for the same listing.
 * @param {string} str
 * @returns {number}
 */
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
    }
    return hash;
}

/**
 * Return a category fallback image URL for a given listing.
 * Always returns the same image for the same (categorySlug, key) pair.
 * Returns null if no images exist for that category.
 *
 * @param {string} categorySlug - e.g. 'restaurants' or 'cafes'
 * @param {string} deterministicKey - e.g. listing.business_slug
 * @returns {string|null}
 */
export function getCategoryFallbackImage(categorySlug, deterministicKey) {
    const normSlug = normaliseCategory(categorySlug);
    const images = categoryImageMap[normSlug];
    if (!images || images.length === 0) return null;
    const index = simpleHash(deterministicKey || normSlug) % images.length;
    return images[index];
}
