const SLUG_ALIASES = {
    'health-wellbeing': 'health-and-wellbeing',
};

export function normaliseCategory(slug) {
    if (!slug) return slug;
    return SLUG_ALIASES[slug] || slug;
}

export function getEmoji(catKey) {
    const map = {
        "food-and-produce": "🍎",
        "drinks-and-brewing": "🍺",
        "craft-and-makers": "🎨",
        "health-and-wellbeing": "🧘",
        "fitness-and-sports": "🏋️",
        "plants-and-garden": "🌱",
        "services": "🔧",
        "entertainment": "🎉",
        "restaurants-and-cafes": "🍕",
        "home-and-interiors": "🏠",
        "hair-and-beauty": "💇",
        "building-and-trades": "🔧",
        "tech-and-digital": "💻",
        "cafes": "☕",
        "pubs-and-bars": "🍺",
        "shops": "🛍️",
        "pet-services": "🐾",
        "education": "📚",
        "legal": "⚖️",
        "automotive": "🚗",
        "events": "🎉",
    };
    return map[normaliseCategory(catKey)] || "📍";
}

export function renderStars(rating) {
    if (!rating) return { full: 0, empty: 5 };
    const full = Math.floor(rating);
    return { full, empty: 5 - full };
}

export function slugToTitle(slug) {
    if (!slug) return '';
    return slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export function truncate(str, len = 120) {
    if (!str) return '';
    return str.length > len ? str.substring(0, len) + '...' : str;
}

export const RANKING_TIERS = {
    editors_choice: {
        label: "Editor's Choice",
        icon: '👑',
        color: '#7C3AED',
        bgColor: '#F5F3FF',
        borderColor: '#7C3AED',
        anchorSlug: 'editors-choice',
        description: 'Hand-picked by our editorial team'
    },
    recommended: {
        label: 'Recommended',
        icon: '⭐',
        color: '#D97706',
        bgColor: '#FFFBEB',
        borderColor: '#F59E0B',
        anchorSlug: 'recommended',
        description: 'Verified and trusted businesses'
    },
    google_ranked: {
        label: 'Top Rated',
        icon: '📊',
        color: '#059669',
        bgColor: '#F0FDF4',
        borderColor: '#10B981',
        anchorSlug: 'google-ranked',
        description: 'Highest rated on Google'
    },
    standard: {
        label: null,
        icon: null,
        color: null,
        bgColor: null,
        borderColor: '#E5E7EB',
        anchorSlug: null,
        description: null
    }
};

export function getTierOrder(tier) {
    const order = { editors_choice: 0, recommended: 1, google_ranked: 2, standard: 3 };
    return order[tier] ?? 3;
}

export function sortByTier(listings) {
    return [...listings].sort((a, b) => {
        const tierDiff = getTierOrder(a.ranking_tier) - getTierOrder(b.ranking_tier);
        if (tierDiff !== 0) return tierDiff;
        if (a.is_featured !== b.is_featured) return b.is_featured ? 1 : -1;
        return (b.google_rating || 0) - (a.google_rating || 0);
    });
}

export function groupByTier(listings) {
    const sorted = sortByTier(listings);
    const groups = {};
    sorted.forEach(l => {
        const tier = l.ranking_tier || 'standard';
        if (!groups[tier]) groups[tier] = [];
        groups[tier].push(l);
    });
    return groups;
}
