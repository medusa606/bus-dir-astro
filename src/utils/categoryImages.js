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
    // ── Sports & Recreation ──────────────────────────────────────────────
    // (Moved before health-and-wellbeing so sports_centre doesn't fall back to yoga)
    { tags: ['climbing', 'climbing_wall'],                                              prefix: 'sports-and-recreation/climbing' },
    { tags: ['sports_centre'],                                                          prefix: 'sports-and-recreation/sports-centre' },
    { tags: ['karting', 'go_kart', 'kart_racing'],                                      prefix: 'sports-and-recreation/karting' },
    { tags: ['padel', 'padel_tennis'],                                                  prefix: 'sports-and-recreation/padel' },
    { tags: ['outdoor', 'outdoor_activities', 'hiking'],                                prefix: 'sports-and-recreation/outdoor' },
    { tags: ['watersports', 'kayak', 'canoeing', 'sailing'],                            prefix: 'sports-and-recreation/watersports' },
    { tags: ['cycling', 'bike_shop', 'bicycle'],                                        prefix: 'sports-and-recreation/cycling' },
    { tags: ['sports_club', 'rugby', 'football_club', 'tennis_club'],                  prefix: 'sports-and-recreation/sports-club' },
    { tags: ['leisure_centre', 'leisure_center'],                                       prefix: 'sports-and-recreation/leisure-centre' },
    { tags: ['golf', 'golf_course'],                                                   prefix: 'sports-and-recreation/golf-course' },
    { tags: ['swimming', 'pool', 'swimming_pool'],                                     prefix: 'sports-and-recreation/swimming-pool' },
    { tags: ['gym', 'fitness', 'crossfit', 'personal_trainer', 'fitness_centre'],     prefix: 'sports-and-recreation/fitness-studio' },

    // ── Health & Wellbeing ────────────────────────────────────────────────
    // (Wellness-specific: massage, spa, yoga, pilates, etc.)
    { tags: ['massage', 'therapist', 'physiotherapist'],                                prefix: 'health-and-wellbeing/massage' },
    { tags: ['beauty', 'cosmetics'],                                                    prefix: 'health-and-wellbeing/hairdresser' },
    { tags: ['clinic', 'medical_centre', 'health_centre'],                              prefix: 'health-and-wellbeing/dentist' },
    { tags: ['herbalist', 'herbalism'],                                                 prefix: 'health-and-wellbeing/pharmacy' },
    { tags: ['acupuncture'],                                                            prefix: 'health-and-wellbeing/acupuncture' },
    { tags: ['chiropractor'],                                                           prefix: 'health-and-wellbeing/chiropractor' },
    { tags: ['osteopath'],                                                              prefix: 'health-and-wellbeing/osteopath' },
    { tags: ['dentist', 'dental'],                                                     prefix: 'health-and-wellbeing/dentist' },
    { tags: ['pharmacy', 'chemist', 'dispensary'],                                     prefix: 'health-and-wellbeing/pharmacy' },
    { tags: ['sauna', 'spa', 'steam_room'],                                            prefix: 'health-and-wellbeing/sauna' },
    { tags: ['yoga', 'pilates', 'meditation', 'wellness'],                              prefix: 'health-and-wellbeing/yoga' },
    { tags: ['nail_salon', 'nails', 'manicure', 'pedicure'],                           prefix: 'health-and-wellbeing/nail-salon' },
    { tags: ['barbershop', 'barber'],                                                   prefix: 'health-and-wellbeing/barbershop' },
    { tags: ['hairdresser', 'hair_salon', 'salon'],                                     prefix: 'health-and-wellbeing/hairdresser' },

    // ── Food & Produce ────────────────────────────────────────────────────
    { tags: ['cheesemonger', 'cheese'],                                                 prefix: 'food-and-produce/cheesemonger' },
    { tags: ['deli', 'delicatessen'],                                                   prefix: 'food-and-produce/deli' },
    { tags: ['sweet_shop', 'sweets', 'confectionery', 'candy'],                        prefix: 'food-and-produce/sweet-shop' },
    { tags: ['bakery', 'cake', 'donut', 'flapjacks'],                                  prefix: 'food-and-produce/bakery' },
    { tags: ['supermarket'],                                                            prefix: 'food-and-produce/supermarket' },
    { tags: ['greengrocer', 'produce', 'veg', 'vegetables', 'fruit'],                  prefix: 'food-and-produce/greengrocer' },
    { tags: ['corner_shop', 'convenience_store', 'convenience'],                        prefix: 'food-and-produce/corner-shop' },
    { tags: ['butcher', 'butchery', 'meat'],                                           prefix: 'food-and-produce/deli' },

    // ── Drinks & Brewing ──────────────────────────────────────────────────
    { tags: ['wine_bar', 'wine', 'cocktail_bar', 'cellar'],                            prefix: 'drinks-and-brewing/wine-bar' },
    { tags: ['off_license', 'off_licence', 'bottle_shop', 'liquor_store'],             prefix: 'drinks-and-brewing/off-license' },
    { tags: ['brewery', 'microbrewery'],                                               prefix: 'drinks-and-brewing/brewery' },
    { tags: ['pub', 'bar', 'tavern', 'taproom'],                                       prefix: 'drinks-and-brewing/pub' },

    // ── Cafes ─────────────────────────────────────────────────────────────
    { tags: ['cafe', 'coffee_shop', 'coffee', 'tea', 'bubble_tea', 'brunch', 'juice', 'sandwich'], prefix: 'cafes/cafe' },

    // ── Restaurants ───────────────────────────────────────────────────────
    // (Cuisine-specific rules before generic restaurant rule)
    { tags: ['sushi', 'sashimi'],                                                       prefix: 'restaurants/sushi' },
    { tags: ['ramen', 'noodle', 'pho', 'korean'],                                       prefix: 'restaurants/noodle' },
    { tags: ['pizza'],                                                                  prefix: 'restaurants/pizza' },
    { tags: ['burger', 'hamburger', 'chicken'],                                         prefix: 'restaurants/burger' },
    { tags: ['kebab', 'shawarma', 'doner', 'falafel', 'middle_eastern', 'lebanese'],   prefix: 'restaurants/kebab' },
    { tags: ['tapas', 'spanish', 'iberian'],                                            prefix: 'restaurants/tapas' },
    { tags: ['indian', 'south_asian'],                                                  prefix: 'restaurants/indian' },
    { tags: ['thai', 'southeast_asian'],                                                prefix: 'restaurants/thai' },
    { tags: ['chinese', 'dim_sum'],                                                     prefix: 'restaurants/chinese' },
    { tags: ['vietnamese', 'asian'],                                                    prefix: 'restaurants/asian' },
    { tags: ['mexican', 'latin', 'caribbean', 'jamaican'],                              prefix: 'restaurants/mexican' },
    { tags: ['italian', 'mediterranean', 'persian'],                                    prefix: 'restaurants/italian' },
    { tags: ['japanese', 'anime'],                                                      prefix: 'restaurants/japanese' },
    { tags: ['turkish', 'turkish_kitchen', 'moroccan'],                                 prefix: 'restaurants/turkish' },
    { tags: ['greek', 'greek_kitchen'],                                                 prefix: 'restaurants/greek' },
    { tags: ['fish_and_chips', 'seafood', 'steak_house'],                               prefix: 'restaurants/fish-and-chips' },
    { tags: ['ice_cream', 'frozen_yogurt', 'dessert', 'pie'],                          prefix: 'restaurants/ice-cream' },
    { tags: ['restaurant', 'fast_food', 'takeaway', 'breakfast', 'british', 'american'], prefix: 'restaurants/restaurant' },

    // ── Entertainment ─────────────────────────────────────────────────────
    { tags: ['cinema'],                                                                prefix: 'entertainment/cinema' },
    { tags: ['theatre', 'theater'],                                                    prefix: 'entertainment/theater' },
    { tags: ['live_music', 'music_venue'],                                              prefix: 'entertainment/live-music' },
    { tags: ['nightclub', 'club'],                                                     prefix: 'entertainment/nightclub' },

    // ── Accommodation ─────────────────────────────────────────────────────
    { tags: ['hotel', 'hotel_chain'],                                                   prefix: 'accommodation/hotel' },
    { tags: ['hostel', 'guest_house', 'bed_and_breakfast', 'b&b', 'airbnb'],          prefix: 'accommodation/hostel' },

    // ── Plants & Garden ───────────────────────────────────────────────────
    { tags: ['florist', 'flowers', 'floristry'],                                       prefix: 'plants-and-garden/florist' },
    { tags: ['garden_centre', 'nursery', 'garden'],                                    prefix: 'plants-and-garden/garden-centre' },
    { tags: ['landscaping', 'landscaper', 'groundskeeper', 'lawn'],                   prefix: 'plants-and-garden/landscaping' },

    // ── Craft & Makers ────────────────────────────────────────────────────
    { tags: ['pottery', 'ceramics'],                                                   prefix: 'craft-and-makers/pottery' },
    { tags: ['weaving', 'textiles', 'knitting', 'sewing'],                             prefix: 'craft-and-makers/weaver' },

    // ── Art & Design ──────────────────────────────────────────────────────
    { tags: ['music_school', 'music_academy', 'music_studio'],                         prefix: 'art-and-design/music' },
    { tags: ['dance_studio', 'dance', 'dance_school'],                                  prefix: 'art-and-design/dance-studio' },
    { tags: ['photography', 'photographer', 'photography_studio'],                     prefix: 'art-and-design/photography-studio' },
    { tags: ['arts_centre', 'gallery', 'studio'],                                      prefix: 'art-and-design/gallery' },
    { tags: ['painter', 'artist'],                                                     prefix: 'art-and-design/painter' },

    // ── Retail & Fashion ──────────────────────────────────────────────────
    { tags: ['shoes', 'shoe_shop', 'footwear', 'cobbler'],                             prefix: 'retail-and-fashion/shoes' },
    { tags: ['clothing', 'fashion', 'boutique', 'apparel', 'dress_shop'],              prefix: 'retail-and-fashion/clothing' },
    { tags: ['bookshop', 'books', 'stationery', 'book_store'],                         prefix: 'retail-and-fashion/bookshop' },

    // ── Home & Interiors ──────────────────────────────────────────────────
    { tags: ['antiques', 'vintage', 'secondhand'],                                     prefix: 'home-and-interiors/antiques' },
    { tags: ['carpet', 'carpet_shop', 'rugs', 'flooring'],                             prefix: 'home-and-interiors/carpet-shop' },
    { tags: ['lighting', 'lighting_shop', 'lamps'],                                    prefix: 'home-and-interiors/lighting-shop' },
    { tags: ['paint_supplies', 'paint_shop', 'decorating'],                            prefix: 'home-and-interiors/paint-supplies' },
    { tags: ['tile_shop', 'tiles', 'tiling'],                                          prefix: 'home-and-interiors/tile-shop' },
    { tags: ['sofa', 'sofa_shop', 'sofas', 'couch'],                                   prefix: 'home-and-interiors/sofa-shop' },
    { tags: ['interiors', 'furniture', 'home_goods', 'homeware'],                      prefix: 'home-and-interiors/home' },

    // ── Services ──────────────────────────────────────────────────────────
    { tags: ['charity_shop', 'charity', 'thrift'],                                     prefix: 'services/charity-shop' },
    { tags: ['dry_cleaning'],                                                           prefix: 'services/dry-cleaning' },
    { tags: ['tailor', 'alterations'],                                                 prefix: 'services/tailors' },
    { tags: ['launderette', 'laundromat', 'laundrette', 'laundry'],                   prefix: 'services/launderette' },
    { tags: ['jewelry', 'jeweller', 'jewelry_store'],                                   prefix: 'retail-and-fashion/shoes' },
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

/**
 * Return an image URL based on an explicitly set image_category.
 * Used when a listing has been manually assigned to a specific image type.
 * Always returns the same image for the same (imageCategory, key) pair.
 * Returns null if the category doesn't exist or has no images.
 *
 * @param {string} imageCategory - e.g. 'services/tailors' or 'restaurants/pizza'
 * @param {string} deterministicKey - e.g. listing.business_slug
 * @returns {string|null}
 */
export function getImageByCategory(imageCategory, deterministicKey) {
    if (!imageCategory) return null;
    const variants = typeImageMap[imageCategory];
    if (!variants || variants.length === 0) return null;
    const index = simpleHash(deterministicKey || imageCategory) % variants.length;
    return variants[index];
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
