/**
 * Extract unique sub-categories from listings with counts
 * @param {Array} listings - Array of listing objects
 * @returns {Array} Array of {name, count, slug} objects
 */
export function getSubCategories(listings) {
  if (!listings || listings.length === 0) {
    return [];
  }

  const subCatMap = {};

  listings.forEach(listing => {
    const subCat = listing.sub_category;
    if (subCat && subCat.trim()) {
      const slug = slugify(subCat);
      if (!subCatMap[slug]) {
        subCatMap[slug] = {
          name: subCat,
          count: 0,
          slug: slug
        };
      }
      subCatMap[slug].count++;
    }
  });

  // Sort by count descending, then alphabetically
  return Object.values(subCatMap)
    .sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }
      return a.name.localeCompare(b.name);
    });
}

/**
 * Filter listings by sub-category
 * @param {Array} listings - Array of listing objects
 * @param {string} subCategorySlug - The slug of the sub-category to filter by
 * @returns {Array} Filtered listings
 */
export function filterBySubCategory(listings, subCategorySlug) {
  if (!subCategorySlug) {
    return listings;
  }

  return listings.filter(listing => {
    const slug = slugify(listing.sub_category || '');
    return slug === subCategorySlug;
  });
}

/**
 * Convert text to URL-safe slug
 */
export function slugify(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/&/g, 'and')
    .replace(/[^\w\-]/g, '');
}
