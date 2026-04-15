/**
 * Sample Business Listing Data
 * Use these as templates when creating new listings in your database
 */

export const SAMPLE_CAFE = {
    id: 1,
    name: 'Artisan Coffee House',
    slug: 'artisan-coffee-house',
    city: 'Portland',
    city_slug: 'portland',
    area: 'Pearl District',
    category: 'Cafés & Coffee',
    rating: 4.7,
    review_count: 128,
    main_image: 'https://images.unsplash.com/photo-1493857671505-72967e2e2760?w=1200&h=600&fit=crop',
    
    // AI-generated illustration fields
    add_listing_illustration: false,       // Curation flag — set true to queue for illustration generation
    illustration_url: null,                // URL to the generated illustration (replaces hero if present)
    illustration_status: null,             // 'pending' | 'queued' | 'generating' | 'completed' | 'failed'
    illustration_source_photo: null,       // Source photo URL used as input for generation
    illustration_generated_at: null,       // Timestamp of when the illustration was generated
    
    tagline: 'Specialty espresso and single-origin beans',
    description: 'Artisan Coffee House is a cozy neighborhood café dedicated to sourcing and roasting the finest single-origin coffees from around the world.',
    owner_writeup: 'We started this café because we believe in crafting the perfect cup of coffee. Every bean is hand-selected and roasted in small batches.',
    
    // Contact info
    address: '2312 NW Lovejoy St, Portland, OR 97210',
    phone: '(503) 555-0123',
    email: 'hello@artisancoffeehouse.com',
    latitude: 45.5231,
    longitude: -122.6966,
        monday: '7:00 AM - 6:00 PM',
        tuesday: '7:00 AM - 6:00 PM',
        wednesday: '7:00 AM - 6:00 PM',
        thursday: '7:00 AM - 8:00 PM',
        friday: '7:00 AM - 8:00 PM',
        saturday: '8:00 AM - 7:00 PM',
        sunday: '8:00 AM - 5:00 PM'
    },
    
    services_offered: [
        'Specialty Coffee',
        'Pastries & Baked Goods',
        'WiFi & Coworking Space',
        'Barista Classes',
        'Bean Retail'
    ],
    
    social_facebook: 'https://facebook.com/artisancoffeehouse',
    social_instagram: 'https://instagram.com/artisancoffeehouse',
    social_twitter: null,
    social_tiktok: null,
    social_youtube: null,
    social_linkedin: null,
    
    reviews: [
        {
            author: 'Sarah M.',
            rating: 5,
            text: 'Best espresso in the city! The baristas really know their craft.'
        },
        {
            author: 'James D.',
            rating: 4,
            text: 'Great atmosphere and quality coffee. Gets busy during peak hours.'
        }
    ],
    
    photo_gallery: [
        'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1495474472906-b7f9dd67ebab?w=400&h=400&fit=crop'
    ],
    
    social_feed: [
        { 
            platform: 'instagram', 
            text: 'New single-origin Ethiopian roast just dropped! ☕',
            date: '2 days ago',
            link: 'https://instagram.com/p/xxx'
        },
        { 
            platform: 'instagram', 
            text: 'Special weekend: Buy 2 get 1 free on all pastries 🥐',
            date: '5 days ago'
        },
        { 
            platform: 'facebook', 
            text: 'Join us for a free cupping event this Saturday!',
            date: '1 week ago'
        }
    ]
};

export const SAMPLE_RESTAURANT = {
    id: 2,
    name: 'Terra Mediterranean',
    slug: 'terra-mediterranean',
    city: 'Portland',
    city_slug: 'portland',
    area: 'Hawthorne',
    category: 'Restaurant',
    rating: 4.5,
    review_count: 287,
    main_image: 'https://images.unsplash.com/photo-1517521318897-c21b40cb7146?w=1200&h=600&fit=crop',
    tagline: 'Traditional Mediterranean cuisine with modern flair',
    description: 'Experience authentic Mediterranean flavors prepared by award-winning chefs using fresh, locally-sourced ingredients.',
    owner_writeup: 'Our family recipe comes from generations in Greece. We believe in bringing that authentic taste to Portland while celebrating local farmers and producers.',
    
    // Contact info
    address: '3456 SE Hawthorne Blvd, Portland, OR 97214',
    phone: '(503) 555-0456',
    email: 'reservations@terramediterranean.com',
    latitude: 45.5156,
    longitude: -122.6454,
    
    opening_hours: {
        monday: 'Closed',
        tuesday: '5:00 PM - 10:00 PM',
        wednesday: '5:00 PM - 10:00 PM',
        thursday: '5:00 PM - 11:00 PM',
        friday: '5:00 PM - 11:00 PM',
        saturday: '4:00 PM - 11:00 PM',
        sunday: '4:00 PM - 9:00 PM'
    },
    
    services_offered: [
        'Dine-in',
        'Takeout',
        'Full Bar',
        'Private Events',
        'Wine Selection'
    ],
    
    social_facebook: 'https://facebook.com/terramediterranean',
    social_instagram: 'https://instagram.com/terramediterranean',
    social_twitter: 'https://twitter.com/terramediterranean',
    social_tiktok: null,
    social_youtube: null,
    social_linkedin: null,
    
    reviews: [
        {
            author: 'Michael L.',
            rating: 5,
            text: 'Absolutely incredible! The branzino was perfectly cooked and the ambiance is perfect for date night.'
        },
        {
            author: 'Jessica K.',
            rating: 5,
            text: 'Finally found authentic Mediterranean food in Portland. The staff is incredibly knowledgeable about wines too.'
        },
        {
            author: 'David R.',
            rating: 4,
            text: 'Great food and service, though a bit pricey. Worth it for special occasions.'
        }
    ],
    
    photo_gallery: [
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1504674900912-b8076fdb50a7?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1514432324607-2e467f4af445?w=400&h=400&fit=crop'
    ],
    
    social_feed: [
        { 
            platform: 'instagram', 
            text: 'Fresh catch arriving daily. Today's special: grilled octopus with lemon & herbs 🐙',
            date: '1 day ago'
        },
        { 
            platform: 'facebook', 
            text: 'Celebrating 5 years in Hawthorne! Join us for happy hour all week with special pricing on wine.',
            date: '3 days ago'
        }
    ]
};

export const SAMPLE_SALON = {
    id: 3,
    name: 'Luxe Hair Studio',
    slug: 'luxe-hair-studio',
    city: 'Portland',
    city_slug: 'portland',
    area: 'Northeast Portland',
    category: 'Salon & Spa',
    rating: 4.9,
    review_count: 156,
    main_image: 'https://images.unsplash.com/photo-1522335617519-31334037c3be?w=1200&h=600&fit=crop',
    tagline: 'Premium hair care and styling services',
    description: 'Luxe Hair Studio offers comprehensive hair care services including cuts, color, treatments, and styling for all hair types.',
    owner_writeup: 'We pride ourselves on staying current with the latest trends while respecting each client\'s unique needs. Every stylist is certified and passionate about their craft.',
    
    // Contact info
    address: '5678 NE Broadway, Portland, OR 97213',
    phone: '(503) 555-0789',
    email: 'book@luxehairstudio.com',
    latitude: 45.5350,
    longitude: -122.6070,
    
    opening_hours: {
        monday: '10:00 AM - 6:00 PM',
        tuesday: '10:00 AM - 8:00 PM',
        wednesday: '10:00 AM - 8:00 PM',
        thursday: '10:00 AM - 8:00 PM',
        friday: '9:00 AM - 7:00 PM',
        saturday: '9:00 AM - 5:00 PM',
        sunday: 'Closed'
    },
    
    services_offered: [
        'Hair Cutting',
        'Color & Highlights',
        'Treatments & Conditioning',
        'Styling',
        'Scalp Treatments'
    ],
    
    social_facebook: 'https://facebook.com/luxehairstudio',
    social_instagram: 'https://instagram.com/luxehairstudio',
    social_twitter: null,
    social_tiktok: 'https://tiktok.com/@luxehairstudio',
    social_youtube: null,
    social_linkedin: null,
    
    reviews: [
        {
            author: 'Amanda B.',
            rating: 5,
            text: 'Alexis transformed my hair color! I get compliments everywhere I go.'
        },
        {
            author: 'Tracy M.',
            rating: 5,
            text: 'Been going here for 3 years. The stylists actually listen to what you want.'
        }
    ],
    
    photo_gallery: [
        'https://images.unsplash.com/photo-1549152291-83fee51de6b7?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1521746695464-b4e5dc92f18e?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1527799820374-dcf8d9129e92?w=400&h=400&fit=crop'
    ],
    
    social_feed: [
        { 
            platform: 'instagram', 
            text: 'New fall color inspo 🍂 Who\'s ready for a transformation?',
            date: '2 days ago'
        },
        { 
            platform: 'tiktok', 
            text: 'That moment when your hair dreams come true ✨ Swipe for the full transformation!',
            date: '1 week ago'
        }
    ]
};

export const SAMPLE_WITH_MINIMAL_DATA = {
    id: 4,
    name: 'Simple Shop',
    slug: 'simple-shop',
    city: 'Portland',
    city_slug: 'portland',
    area: null,  // Optional - can be null
    category: 'Retail',
    rating: 4.2,
    review_count: 45,
    main_image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&h=600&fit=crop',
    tagline: 'Quality goods, simple approach',
    description: 'A curated selection of handmade and locally-sourced products.',
    owner_writeup: null,  // Optional - can be null
    
    // Contact info (optional)
    address: null,
    phone: null,
    email: 'info@simpleshop.com',
    latitude: null,
    longitude: null,
    
    opening_hours: null,  // Entire section can be null
    
    services_offered: null,  // Can be null or empty array
    
    social_facebook: null,
    social_instagram: 'https://instagram.com/simpleshoppdx',
    social_twitter: null,
    social_tiktok: null,
    social_youtube: null,
    social_linkedin: null,
    
    reviews: null,  // No reviews yet
    
    photo_gallery: [],  // Empty gallery
    
    social_feed: null  // No social feed
};

export const BUSINESS_TYPES = {
    RESTAURANT: 'restaurant',
    CAFE: 'cafe',
    SERVICE: 'service',
    RETAIL: 'retail',
    ENTERTAINMENT: 'entertainment',
    PROFESSIONAL: 'professional'
};

export const CATEGORIES = [
    'Restaurants',
    'Cafés & Coffee',
    'Bars & Nightlife',
    'Salons & Spas',
    'Fitness & Wellness',
    'Retail & Shopping',
    'Personal Services',
    'Home Services',
    'Arts & Entertainment',
    'Food & Grocery',
    'Professional Services'
];

export const AREA_EXAMPLES = [
    'Pearl District',
    'Hawthorne',
    'Southeast Portland',
    'Northeast Portland',
    'Southwest Portland',
    'Northwest Portland',
    'Downtown',
    'Old Town'
];
