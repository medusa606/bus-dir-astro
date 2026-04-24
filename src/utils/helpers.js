const SLUG_ALIASES = {
    'health-wellbeing': 'health-and-wellbeing',
    'restaurants-and-cafes': 'restaurants',
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
        "restaurants": "🍽️",
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

const SOCIAL_BASE_URLS = {
    instagram: 'https://www.instagram.com/',
    facebook:  'https://www.facebook.com/',
    twitter:   'https://x.com/',
    tiktok:    'https://www.tiktok.com/@',
    linkedin:  'https://www.linkedin.com/company/',
    youtube:   'https://www.youtube.com/@',
};

export function normalizeSocialUrl(platform, value) {
    if (!value) return value;
    if (value.startsWith('http://') || value.startsWith('https://')) return value;
    const base = SOCIAL_BASE_URLS[platform];
    if (!base) return value;
    // Strip a leading '@' for platforms whose base URL already includes it
    const handle = (platform === 'tiktok' || platform === 'youtube')
        ? value.replace(/^@/, '')
        : value;
    return base + handle;
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
