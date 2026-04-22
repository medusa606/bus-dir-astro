import { normaliseCategory } from './helpers.js';

// Discover all category illustration webps at build time.
// Keys are like: /public/illustrations/category-slug/restaurants-and-cafes/cafe-01.webp
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
 * @param {string} categorySlug - e.g. 'restaurants-and-cafes'
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
