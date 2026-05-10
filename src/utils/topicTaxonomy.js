/**
 * topicTaxonomy.js
 *
 * Single source of truth: URL slug → Supabase query config for "best of" landing pages.
 * queryType values:
 *   'category_slug'  – match listings.category_slug
 *   'area_slug'      – match listings.area_slug
 *   'tags_any'       – match listings where tags array contains any of queryValues
 *   'sub_category'   – match listings.sub_category (case-insensitive)
 *   'tags_or_sub'    – try tags_any first, also include sub_category matches
 */

export const TOPIC_TAXONOMY = {
    // ── Tag-based food & drink topics ──────────────────────────────────────
    breakfast: {
        label: 'Breakfast',
        pluralLabel: 'Breakfast Spots',
        queryType: 'tags_any',
        queryValues: ['breakfast'],
        emoji: '🍳',
        minListings: 3,
    },
    brunch: {
        label: 'Brunch',
        pluralLabel: 'Brunch Spots',
        queryType: 'tags_any',
        queryValues: ['brunch'],
        emoji: '🥞',
        minListings: 3,
    },
    pizza: {
        label: 'Pizza',
        pluralLabel: 'Pizza Places',
        queryType: 'tags_or_sub',
        queryValues: ['pizza'],
        subCategoryValue: 'Pizza',
        emoji: '🍕',
        minListings: 3,
    },
    burgers: {
        label: 'Burgers',
        pluralLabel: 'Burger Joints',
        queryType: 'tags_any',
        queryValues: ['burger', 'hamburger'],
        emoji: '🍔',
        minListings: 3,
    },
    'sunday-lunch': {
        label: 'Sunday Lunch',
        pluralLabel: 'Sunday Lunch Spots',
        queryType: 'tags_any',
        queryValues: ['british', 'pub'],
        emoji: '🥩',
        minListings: 3,
    },
    steak: {
        label: 'Steak',
        pluralLabel: 'Steak Restaurants',
        queryType: 'tags_any',
        queryValues: ['steak_house'],
        emoji: '🥩',
        minListings: 3,
    },
    cocktails: {
        label: 'Cocktails',
        pluralLabel: 'Cocktail Bars',
        queryType: 'tags_any',
        queryValues: ['cocktail_bar'],
        emoji: '🍸',
        minListings: 3,
    },
    'craft-ale': {
        label: 'Craft Ale',
        pluralLabel: 'Craft Ale Spots',
        queryType: 'tags_any',
        queryValues: ['brewery', 'microbrewery', 'taproom'],
        emoji: '🍺',
        minListings: 3,
    },
    coffee: {
        label: 'Coffee',
        pluralLabel: 'Coffee Shops',
        queryType: 'tags_any',
        queryValues: ['coffee', 'coffee_shop'],
        emoji: '☕',
        minListings: 3,
    },
    indian: {
        label: 'Indian',
        pluralLabel: 'Indian Restaurants',
        queryType: 'tags_or_sub',
        queryValues: ['indian', 'south_asian'],
        subCategoryValue: 'Indian',
        emoji: '🍛',
        minListings: 3,
    },
    sushi: {
        label: 'Sushi',
        pluralLabel: 'Sushi Restaurants',
        queryType: 'tags_or_sub',
        queryValues: ['sushi', 'sashimi'],
        subCategoryValue: 'Sushi',
        emoji: '🍣',
        minListings: 3,
    },
    italian: {
        label: 'Italian',
        pluralLabel: 'Italian Restaurants',
        queryType: 'tags_or_sub',
        queryValues: ['italian'],
        subCategoryValue: 'Italian',
        emoji: '🍝',
        minListings: 3,
    },
    // ── Category-based topics ────────────────────────────────────────────
    cafes: {
        label: 'Cafes',
        pluralLabel: 'Cafes',
        queryType: 'category_slug',
        queryValues: ['cafes', 'restaurants-and-cafes'],
        emoji: '☕',
        minListings: 5,
    },
    restaurants: {
        label: 'Restaurants',
        pluralLabel: 'Restaurants',
        queryType: 'category_slug',
        queryValues: ['restaurants', 'restaurants-and-cafes'],
        emoji: '🍽️',
        minListings: 5,
    },
    'pubs-and-bars': {
        label: 'Pubs & Bars',
        pluralLabel: 'Pubs & Bars',
        queryType: 'category_slug',
        queryValues: ['pubs-and-bars'],
        emoji: '🍺',
        minListings: 5,
    },
};

/**
 * Given a topic slug, filter listings from an already-fetched array.
 * Returns filtered array or null if the topic is unknown.
 */
export function filterListingsByTopic(listings, topicSlug) {
    const topic = TOPIC_TAXONOMY[topicSlug];
    if (!topic) return null;

    const { queryType, queryValues, subCategoryValue } = topic;

    if (queryType === 'category_slug') {
        return listings.filter(l => queryValues.includes(l.category_slug));
    }
    if (queryType === 'tags_any') {
        return listings.filter(l =>
            Array.isArray(l.tags) && l.tags.some(t => queryValues.includes(t))
        );
    }
    if (queryType === 'tags_or_sub') {
        return listings.filter(l => {
            const tagMatch = Array.isArray(l.tags) && l.tags.some(t => queryValues.includes(t));
            const subMatch = subCategoryValue &&
                l.sub_category?.toLowerCase() === subCategoryValue.toLowerCase();
            return tagMatch || subMatch;
        });
    }
    if (queryType === 'sub_category') {
        return listings.filter(l =>
            l.sub_category?.toLowerCase() === queryValues[0]?.toLowerCase()
        );
    }
    return null;
}

/**
 * Returns all topic slugs that are valid for a given set of listings
 * (i.e. produce >= minListings results after filtering).
 */
export function getValidTopics(listings) {
    return Object.entries(TOPIC_TAXONOMY)
        .filter(([slug, topic]) => {
            const filtered = filterListingsByTopic(listings, slug);
            return filtered && filtered.length >= topic.minListings;
        })
        .map(([slug]) => slug);
}
