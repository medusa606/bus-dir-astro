import { normaliseCategory } from './helpers.js';

/**
 * Priority-ordered tag → illustration mapping.
 * The first matching rule wins, so more-specific types must appear before
 * broader categories (e.g. cheesemonger before corner-shop, wine-bar before pub).
 *
 * Tags are matched case-insensitively with underscores and hyphens treated as
 * equivalent (see normaliseTag below).
 */
export const TAG_TO_IMAGE_RULES = [
    // ── Health & Wellbeing ────────────────────────────────────────────────
    { tags: ['yoga', 'pilates', 'meditation', 'wellness'],                              image: '/illustrations/category-slug/health-and-wellbeing/yoga-01.webp' },
    { tags: ['nail_salon', 'nails', 'manicure', 'pedicure'],                           image: '/illustrations/category-slug/health-and-wellbeing/nail-salon-01.webp' },
    { tags: ['barbershop', 'barber'],                                                   image: '/illustrations/category-slug/health-and-wellbeing/barbershop-01.webp' },
    { tags: ['hairdresser', 'hair_salon', 'salon'],                                     image: '/illustrations/category-slug/health-and-wellbeing/hairdresser-01.webp' },

    // ── Food & Produce ────────────────────────────────────────────────────
    { tags: ['cheesemonger', 'cheese'],                                                 image: '/illustrations/category-slug/food-and-produce/cheesemonger-01.webp' },
    { tags: ['deli', 'delicatessen'],                                                   image: '/illustrations/category-slug/food-and-produce/deli.webp' },
    { tags: ['bakery', 'cake', 'donut', 'flapjacks'],                                  image: '/illustrations/category-slug/food-and-produce/bakery-01.webp' },
    { tags: ['supermarket'],                                                            image: '/illustrations/category-slug/food-and-produce/supermarket-01.webp' },
    { tags: ['corner_shop', 'convenience_store'],                                       image: '/illustrations/category-slug/food-and-produce/corner-shop-01.webp' },

    // ── Drinks & Brewing ──────────────────────────────────────────────────
    { tags: ['wine_bar', 'wine', 'cocktail_bar', 'cellar'],                            image: '/illustrations/category-slug/drinks-and-brewing/wine-bar-01.webp' },
    { tags: ['pub', 'bar', 'tavern', 'brewery', 'taproom'],                            image: '/illustrations/category-slug/drinks-and-brewing/pub-01.webp' },

    // ── Cafes ─────────────────────────────────────────────────────────────
    { tags: ['cafe', 'coffee_shop', 'coffee', 'tea', 'bubble_tea', 'brunch', 'juice'], image: '/illustrations/category-slug/cafes/cafe-01.webp' },

    // ── Restaurants ───────────────────────────────────────────────────────
    { tags: ['ice_cream', 'frozen_yogurt', 'dessert'],                                 image: '/illustrations/category-slug/restaurants/ice-cream-01.webp' },
    { tags: ['restaurant', 'fast_food', 'takeaway'],                                   image: '/illustrations/category-slug/restaurants/restaurant-01.webp' },

    // ── Fitness & Sports ──────────────────────────────────────────────────
    { tags: ['golf', 'golf_course'],                                                   image: '/illustrations/category-slug/fitness-and-sports/golf-course-01.webp' },
    { tags: ['swimming', 'pool', 'swimming_pool'],                                     image: '/illustrations/category-slug/fitness-and-sports/swimming-pool-01.webp' },
    { tags: ['gym', 'fitness', 'crossfit', 'personal_trainer'],                        image: '/illustrations/category-slug/fitness-and-sports/fitness-studio-01.webp' },

    // ── Entertainment ─────────────────────────────────────────────────────
    { tags: ['theatre', 'theater', 'cinema'],                                          image: '/illustrations/category-slug/entertainment/theater-01.webp' },
    { tags: ['live_music', 'music_venue'],                                              image: '/illustrations/category-slug/entertainment/live-music-01.webp' },
    { tags: ['nightclub', 'club'],                                                     image: '/illustrations/category-slug/entertainment/nightclub-01.webp' },

    // ── Plants & Garden ───────────────────────────────────────────────────
    { tags: ['florist', 'flowers', 'floristry'],                                       image: '/illustrations/category-slug/plants-and-garden/florist-01.webp' },
    { tags: ['garden_centre', 'nursery', 'garden'],                                    image: '/illustrations/category-slug/plants-and-garden/garden-centre-01.webp' },

    // ── Services ──────────────────────────────────────────────────────────
    { tags: ['dry_cleaning'],                                                           image: '/illustrations/category-slug/services/dry-cleaning-01.webp' },
    { tags: ['tailor', 'alterations'],                                                 image: '/illustrations/category-slug/services/tailors-01.webp' },
    { tags: ['launderette', 'laundromat', 'laundrette'],                               image: '/illustrations/category-slug/services/launderette-01.webp' },

    // ── Craft & Makers ────────────────────────────────────────────────────
    { tags: ['pottery', 'ceramics'],                                                   image: '/illustrations/category-slug/craft-and-makers/pottery-01.webp' },
    { tags: ['weaving', 'textiles', 'knitting', 'sewing'],                             image: '/illustrations/category-slug/craft-and-makers/weaver-01.webp' },

    // ── Art & Design ──────────────────────────────────────────────────────
    { tags: ['arts_centre', 'gallery', 'studio'],                                      image: '/illustrations/category-slug/art-and-design/gallery-01.webp' },
    { tags: ['painter', 'artist'],                                                     image: '/illustrations/category-slug/art-and-design/painter-01.webp' },

    // ── Home & Interiors ──────────────────────────────────────────────────
    { tags: ['interiors', 'furniture', 'home_goods', 'homeware'],                      image: '/illustrations/category-slug/home-and-interiors/home-01.webp' },
];

/** Normalise a tag for comparison: lowercase, underscores → hyphens stripped. */
function normaliseTag(tag) {
    return tag.toLowerCase().replace(/[_-]/g, '');
}

/**
 * Return the best-matching illustration URL for a listing based on its tags.
 * Uses TAG_TO_IMAGE_RULES in priority order — first match wins.
 * Falls back to getCategoryFallbackImage if no tag matches.
 *
 * @param {string[]|null} tags            - e.g. ['cafe', 'bakery']
 * @param {string}        categorySlug    - e.g. 'cafes'
 * @param {string}        deterministicKey - e.g. listing.business_slug
 * @returns {string|null}
 */
export function getTagBasedImage(tags, categorySlug, deterministicKey) {
    if (Array.isArray(tags) && tags.length > 0) {
        const normalisedListingTags = tags.map(normaliseTag);
        for (const rule of TAG_TO_IMAGE_RULES) {
            const normalisedRuleTags = rule.tags.map(normaliseTag);
            if (normalisedListingTags.some(lt => normalisedRuleTags.includes(lt))) {
                return rule.image;
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
