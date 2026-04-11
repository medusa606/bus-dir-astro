# Listing Page - Supabase Integration

## Status: ✅ Connected to Your Database

The listing page is now querying from your actual Supabase `listings` table. Here's what's been configured:

## How It Works

### Route Generation
The page automatically generates routes for all published listings using:
- `business_slug` as the URL parameter
- Only shows listings where `status = 'Published'`

**Generated URL format:**
```
/listing/{business_slug}
```

### Field Mapping
Your database fields are automatically mapped to the template:

| Your DB Field | Template Field | Usage |
|---|---|---|
| `name` | `name` | Business name |
| `business_slug` | `slug` | Page URL |
| `city_slug` | `city` | Breadcrumb, location |
| `area_slug` | `area` | Location tag |
| `category` | `category` | Category tag |
| `category_slug` | `category_slug` | Navigation |
| `google_summary` | `tagline` | Short description under name |
| `description` | `description` | Main about section |
| `story_draft` | `owner_writeup` | Story/quote box in about |
| `google_rating` | `rating` | Star rating display |
| `google_review_count` | `review_count` | Review count badge |
| `image_url` | `main_image` | Hero background + gallery |
| `photo_url` | `main_image` | Fallback if image_url null |
| `address` | `address` | Contact info + map |
| `phone` | `phone` | Clickable tel: link |
| `email` | `email` | Clickable mailto: link |
| `website` | `website` | Website link in contact info |
| `google_maps_url` | `google_maps_url` | Direct Google Maps link |
| `latitude` | `latitude` | Map widget center |
| `longitude` | `longitude` | Map widget center |
| `opening_hours` | `opening_hours` | Hours widget (parsed if JSON string) |
| `tags` | `services_offered` | Services grid |
| `social_facebook` | `social_facebook` | Facebook link |
| `social_instagram` | `social_instagram` | Instagram link |
| `social_twitter` | `social_twitter` | Twitter/X link |
| `social_tiktok` | `social_tiktok` | TikTok link |
| `social_youtube` | `social_youtube` | YouTube link |
| `social_linkedin` | `social_linkedin` | LinkedIn link |

## What's Ready to Use

✅ **Contact Information**
- Address (uses google_maps_url if available, builds from address if not)
- Phone (clickable tel: link)
- Email (clickable mailto: link)
- Website (if provided)

✅ **Map Widget**
- Interactive map centered on latitude/longitude
- Zoomable and draggable
- Marker shows business location

✅ **Services**
- Displays `tags` array as service offerings

✅ **Social Links**
- All 6 social platforms supported
- Automatically hidden if null

✅ **Rating & Reviews**
- Uses `google_rating` and `google_review_count`
- Review content from Google needs separate implementation

## What's Not Yet Implemented

❌ **Reviews** - Currently null
- You'll need to decide on review source:
  - Import from Google (complex)
  - Store your own in separate table
  - Combine multiple sources

❌ **Social Feed** - Currently null
- Posts from social platforms
- Would need separate data structure or API integration

❌ **Multiple Photos** - Currently uses single image
- If you want multiple photos, add a `photos` JSONB array to schema
- Or link to a separate `listing_photos` table

## Testing the Connection

1. **Ensure you have published listings:**
   ```sql
   UPDATE listings SET status = 'Published' WHERE id = 'some-id';
   ```

2. **Check that business_slug is set:**
   ```sql
   SELECT business_slug, name FROM listings LIMIT 5;
   ```

3. **Visit the listing:**
   ```
   http://localhost:4321/listing/{business_slug}
   ```

## Troubleshooting

### Page Not Found (404)
- Check that `status = 'Published'`
- Verify `business_slug` exists and matches URL

### No Image Showing
- Ensure `image_url` or `photo_url` has a valid URL
- Check CORS if using external URLs

### Opening Hours Not Displaying
- Check format of `opening_hours` field
- If stored as JSON string, it will be automatically parsed
- If stored as text, it displays as-is

### Location Not Mapping
- Verify `latitude` and `longitude` are valid numbers
- Check that both are present (either alone won't show map)

## Future Enhancements

### To Add Reviews
Create a `listing_reviews` table:
```sql
CREATE TABLE listing_reviews (
    id UUID PRIMARY KEY,
    listing_id UUID REFERENCES listings(id),
    author TEXT,
    rating INTEGER,
    text TEXT,
    created_at TIMESTAMP
);
```

Then update the page to fetch:
```astro
const { data: reviews } = await supabase
    .from('listing_reviews')
    .select('*')
    .eq('listing_id', business.id);
```

### To Add Social Feed
Add to listings table:
```sql
ALTER TABLE listings ADD COLUMN social_feed JSONB;
```

Structure:
```json
[
    {
        "platform": "instagram",
        "text": "Post text here",
        "date": "2 days ago",
        "link": "https://..."
    }
]
```

### To Add Multiple Photos
Create `listing_photos` table:
```sql
CREATE TABLE listing_photos (
    id UUID PRIMARY KEY,
    listing_id UUID REFERENCES listings(id),
    url TEXT NOT NULL,
    created_at TIMESTAMP
);
```

Or add to listings:
```sql
ALTER TABLE listings ADD COLUMN photos TEXT[];
```

## Current Sample Data

If you need test data, the schema supports:
- Minimal: name, category, address, city_slug, business_slug
- Full: All 30+ fields with complete details

Any missing optional fields will simply hide those sections on the page - no errors!

## Next Steps

1. ✅ Schema is set
2. ✅ Supabase connection working
3. ✅ All DB fields mapped
4. 📝 Add sample or real listings with status='Published'
5. 📝 Visit listing pages to verify display
6. 📝 Optional: Add reviews and social feed
7. 📝 Optional: Link from homepage to listings

Happy listing! 🎉
