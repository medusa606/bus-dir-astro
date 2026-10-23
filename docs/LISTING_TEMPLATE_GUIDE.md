# Listing Page Template Guide

## Overview
The listing page template (`src/pages/listing/[slug].astro`) is designed to showcase individual businesses with flexible field handling. It gracefully handles missing data and provides a beautiful, structured layout.

## Key Features

### 1. **Faded Impressionist Background**
- Uses CSS blur filters on the main image
- Creates a soft, artistic backdrop effect
- Reduces opacity to maintain readability

```astro
<div class="listing-hero" style={`--bg-image: url('${business.main_image}')`}>
    <div class="listing-hero__blur"></div>
    <div class="listing-hero__overlay"></div>
</div>
```

### 2. **Flexible Field Handling**
All optional fields are wrapped in conditional blocks:

```astro
{business.opening_hours && (
    <div class="sidebar-widget">
        {/* Hours content */}
    </div>
)}
```

**Optional fields:**
- `opening_hours` - Null if not provided
- `services_offered` - Skip section if empty array
- `reviews` - Only show if array has items
- `owner_writeup` - Only display in about section if present
- `photo_gallery` - Omit section if no photos
- `social_feed` - Optional within social widget

### 3. **Social Media Integration**

The page supports:
- Direct social links (Facebook, Instagram, Twitter/X, TikTok, LinkedIn, YouTube)
- Social feed with latest posts
- Larger social icons via sidebar widget

**Social field naming convention:**
```javascript
social_facebook: 'https://facebook.com/...',
social_instagram: 'https://instagram.com/...',
social_twitter: null,  // Optional - can be null
social_tiktok: null,
social_youtube: null,
social_linkedin: null
```

### 4. **Feed Wheel Concept**
The `.social-feed` section displays latest posts in a scrollable/stacked format:

```javascript
social_feed: [
    { 
        platform: 'instagram', 
        text: 'Your post text here',
        date: 'X days ago' 
    }
]
```

### 5. **Photo/Video from Social**
Use the `photo_gallery` array for images sourced from social platforms:

```javascript
photo_gallery: [
    'https://url-to-image-1.jpg',
    'https://url-to-image-2.jpg',
    'https://url-to-image-3.jpg'
]
```

## Database Schema Example (Supabase)

```sql
CREATE TABLE listings (
    id UUID PRIMARY KEY,
    slug VARCHAR UNIQUE,
    name VARCHAR NOT NULL,
    tagline VARCHAR,
    category VARCHAR,
    category_slug VARCHAR,
    area VARCHAR,
    area_slug VARCHAR,
    city VARCHAR,
    city_slug VARCHAR,
    main_image URL,
    description TEXT,
    owner_writeup TEXT,
    rating DECIMAL(2,1),
    review_count INT,
    
    -- JSON fields for flexible data
    opening_hours JSONB,           -- null or object
    services_offered TEXT[],       -- array or null
    photo_gallery URL[],           -- array or null
    social_feed JSONB,             -- array or null
    reviews JSONB,                 -- array or null
    
    -- Social fields
    social_facebook URL,
    social_instagram URL,
    social_twitter URL,
    social_tiktok URL,
    social_youtube URL,
    social_linkedin URL,
    
    status VARCHAR,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## Customization for Different Business Types

You can create specialized versions of this template for different industries:

### Example 1: Restaurant Template
- Emphasize menu items and cuisine types
- Add reservation options
- Highlight delivery/takeout options
- Show operating hours prominently

### Example 2: Service Provider Template
- Focus on service offerings
- Add testimonials section
- Highlight certifications/qualifications
- Booking calendar

### Example 3: Retail Template
- Gallery-focused layout
- Product categories
- Sale/promotion highlights
- Store location & directions

### Implementation Strategy

Create subfolders for different business types:
```
src/pages/listing/
├── [slug].astro          # Main template
├── restaurant/
│   └── [slug].astro      # Restaurant-specific
├── service/
│   └── [slug].astro      # Service-specific
└── retail/
    └── [slug].astro      # Retail-specific
```

Or use a conditional component approach:

```astro
---
import ListingRestaurant from '../../components/ListingRestaurant.astro';
import ListingService from '../../components/ListingService.astro';
import ListingDefault from '../../components/ListingDefault.astro';

// Determine which template to use
let ListingTemplate = ListingDefault;
if (business.business_type === 'restaurant') {
    ListingTemplate = ListingRestaurant;
} else if (business.business_type === 'service') {
    ListingTemplate = ListingService;
}
---

<ListingTemplate {business} />
```

## Styling Notes

The template uses the global.css custom properties:
- **Colors**: `--taupe`, `--powder-blush`, `--parchment`, etc.
- **Spacing**: `--space-sm`, `--space-md`, `--space-lg`, etc.
- **Shadows**: `--shadow-sm`, `--shadow-lg`, etc.
- **Transitions**: `--transition` for consistent animations

Customize by editing `/src/styles/global.css`.

## Data Sources

Currently uses sample data. To connect to Supabase:

```astro
---
import { supabase } from '../../lib/supabase.js';

const { slug } = Astro.params;
const { data: business } = await supabase
    .from('listings')
    .select('*')
    .eq('slug', slug)
    .single();

// Handle not found
if (!business) {
    return Astro.redirect('/404');
}
---
```

## Future Enhancements

- [ ] Video embeds from social platforms
- [ ] Interactive map integration
- [ ] Live review aggregation
- [ ] Booking/reservation system
- [ ] Image lightbox gallery
- [ ] Related listings recommendations
- [ ] Social media feed auto-sync (API polling)
