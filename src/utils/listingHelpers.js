/**
 * Listing utility functions for handling business data
 */

/**
 * Format opening hours into a readable display
 * @param hours - Object with day names as keys and time strings as values
 * @returns Formatted hours object or null if invalid
 */
export function formatOpeningHours(hours) {
    if (!hours || typeof hours !== 'object') return null;
    
    const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const formatted = {};
    
    dayOrder.forEach(day => {
        if (hours[day]) {
            formatted[day] = hours[day];
        }
    });
    
    return Object.keys(formatted).length > 0 ? formatted : null;
}

/**
 * Check if a business is currently open
 * @param hours - Opening hours object
 * @returns Object with isOpen boolean and message
 */
export function isCurrentlyOpen(hours) {
    if (!hours) return null;
    
    const now = new Date();
    const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
    const currentTime = now.getHours() * 100 + now.getMinutes();
    
    const todayHours = hours[dayName];
    if (!todayHours || todayHours.toLowerCase() === 'closed') {
        return { isOpen: false, message: 'Currently closed' };
    }
    
    // Simple time parsing - assumes format like "9:00 AM - 5:00 PM"
    const timeRegex = /(\d{1,2}):(\d{2})\s*(AM|PM)\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i;
    const match = todayHours.match(timeRegex);
    
    if (!match) return null;
    
    const openTime = parse12HourTime(match[1], match[2], match[3]);
    const closeTime = parse12HourTime(match[4], match[5], match[6]);
    
    const isOpen = currentTime >= openTime && currentTime <= closeTime;
    
    return {
        isOpen,
        message: isOpen ? 'Open now' : 'Currently closed',
        todayHours
    };
}

/**
 * Convert 12-hour time to 24-hour format for comparison
 */
function parse12HourTime(hours, minutes, period) {
    let h = parseInt(hours);
    const m = parseInt(minutes);
    
    if (period.toUpperCase() === 'PM' && h !== 12) h += 12;
    if (period.toUpperCase() === 'AM' && h === 12) h = 0;
    
    return h * 100 + m;
}

/**
 * Check if business has complete address info
 */
export function hasLocationInfo(business) {
    return !!(business.city || business.address || business.area);
}

/**
 * Filter out null/empty social links
 */
export function getActiveSocialLinks(business) {
    const socialPlatforms = ['facebook', 'instagram', 'twitter', 'tiktok', 'youtube', 'linkedin'];
    const active = {};
    
    socialPlatforms.forEach(platform => {
        const key = `social_${platform}`;
        if (business[key]) {
            active[platform] = business[key];
        }
    });
    
    return Object.keys(active).length > 0 ? active : null;
}

/**
 * Get social platform from URL
 */
export function extractPlatformFromUrl(url) {
    if (!url) return null;
    const platforms = {
        facebook: /facebook\.com/i,
        instagram: /instagram\.com/i,
        twitter: /twitter\.com|x\.com/i,
        tiktok: /tiktok\.com/i,
        youtube: /youtube\.com|youtu\.be/i,
        linkedin: /linkedin\.com/i
    };
    
    for (const [platform, regex] of Object.entries(platforms)) {
        if (regex.test(url)) return platform;
    }
    return null;
}

/**
 * Validate business object has minimum required fields
 */
export function isValidBusiness(business) {
    return !!(business.id && business.name && business.slug);
}

/**
 * Get total average rating if multiple sources exist
 */
export function getAverageRating(business) {
    if (!business.rating) return null;
    
    // Can be enhanced to average ratings from multiple review sources
    return Math.round(business.rating * 10) / 10;
}

/**
 * Format review count for display
 */
export function getReviewLabel(count) {
    if (count === 0) return 'No reviews yet';
    if (count === 1) return '1 review';
    return `${count} reviews`;
}

/**
 * Get a default business type from category
 */
export function guessBusinessType(category) {
    const types = {
        restaurant: ['restaurant', 'cafe', 'cafe & coffee', 'bakery', 'bistro', 'bar'],
        retail: ['shop', 'boutique', 'store', 'market', 'florist'],
        service: ['salon', 'spa', 'gym', 'dental', 'doctor', 'repair', 'cleaning'],
        entertainment: ['theater', 'cinema', 'museum', 'gallery', 'venue']
    };
    
    if (!category) return 'default';
    
    const lowerCategory = category.toLowerCase();
    for (const [type, keywords] of Object.entries(types)) {
        if (keywords.some(keyword => lowerCategory.includes(keyword))) {
            return type;
        }
    }
    
    return 'default';
}

/**
 * Build SEO meta tags for listing page
 */
export function getListingSEO(business) {
    return {
        title: `${business.name} - ${business.category || 'Business'} in ${business.city}`,
        description: business.tagline || business.description?.substring(0, 150) || `Visit ${business.name}`,
        image: business.main_image || '/default-og.jpg'
    };
}
