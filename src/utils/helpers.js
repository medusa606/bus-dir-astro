export function getEmoji(catKey) {
    const map = {
        "restaurants-cafes": "🍕",
        "food-produce": "🍎",
        "drinks-brewing": "🍺",
        "craft-makers": "🎨",
        "home-interiors": "🏠",
        "health-wellbeing": "🧘",
        "hair-beauty": "💇",
        "building-trades": "🔧",
        "tech-digital": "💻",
        "cafes": "☕",
        "pubs-bars": "🍺",
        "shops": "🛍️",
        "gyms-fitness": "🏋️",
        "pet-services": "🐾",
        "education": "📚",
        "legal": "⚖️",
        "automotive": "🚗",
        "events": "🎉"
    };
    return map[catKey] || "📍";
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
    if (!str) return 'No description available.';
    return str.length > len ? str.substring(0, len) + '...' : str;
}
