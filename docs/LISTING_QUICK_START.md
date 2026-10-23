# Quick Start Guide - Listing Page

## View the Sample Listing

The listing page template is ready to view immediately with sample data.

### Step 1: Run your dev server
```bash
npm run dev
```

### Step 2: Visit the sample listing
Open your browser and go to:
```
http://localhost:3000/listing/artisan-coffee-house
```

### Step 3: What you'll see

A complete business listing page featuring:

**Header Section:**
- Business name (Artisan Coffee House)
- Tagline
- Category tag (Cafés & Coffee)
- Location tag (Pearl District)
- Star rating (4.7 ⭐)
- Review count

**Main Content (Left Side):**
- About section with description
- Owner's personal message (in styled quote box)
- "What They Offer" - services grid
- Photo gallery (3 sample images)
- Customer reviews section

**Sidebar (Right Side):**
- Hours widget (opens/closes times for each day)
- Connect widget with social links
- Latest Updates feed (3 social posts)
- Contact form CTA button

---

## Layout Features

### Desktop (1200px+)
- 2-column layout: 2/3 width main content, 1/3 sidebar
- Hero header with background blur effect
- All sections visible

### Tablet (768px - 1024px)
- Sidebar moves below main content
- Single column layout
- Services in 1 column instead of 2

### Mobile (<768px)
- Full single column
- Shorter hero height
- Buttons stack vertically
- Gallery shows 1 image per row

---

## The Faded Impressionist Effect

The background image in the hero section uses CSS blur:

```css
/* Creates the soft, impressionist look */
filter: blur(40px) opacity(0.4);
```

This creates a subtle, artistic backdrop while keeping the overlay gradient legible.

---

## How Fields Are Handled

### If opening_hours is NULL
**Result:** Hours section doesn't appear in sidebar

### If services_offered is empty
**Result:** "What They Offer" section is skipped entirely

### If reviews array is empty
**Result:** Reviews section is hidden

### If owner_writeup is NULL
**Result:** Quote box doesn't appear, just description

### If photo_gallery is empty
**Result:** Photos section is removed

### If social_feed is NULL
**Result:** "Latest Updates" feed doesn't show in Connect widget

**All these work automatically** - no configuration needed!

---

## Sample Data You Can Reference

### Minimal Data Listing
See `src/data/sampleListings.js` → `SAMPLE_WITH_MINIMAL_DATA`
- Very few optional fields
- Still looks great
- Good for testing null handling

### Restaurant Example
See `src/data/sampleListings.js` → `SAMPLE_RESTAURANT`
- Full data
- Multiple reviews
- Complete hours/services
- Active social feed

### Service Business
See `src/data/sampleListings.js` → `SAMPLE_SALON`
- Service-focused data
- TikTok included
- Styled differently than products

---

## Customization Starters

### Change the Hero Background Blur
Edit `src/pages/listing/[slug].astro`, line ~85:
```css
filter: blur(40px) opacity(0.4);  /* Adjust blur amount (higher = more blurry) */
```

### Change Social Feed Position
The feed appears in the sidebar. To move it to main content, copy the `<SocialFeed />` component to any section.

### Adjust Responsive Breakpoints
Look for `@media (max-width: ...)` in the page styles to adjust when layout changes.

### Hide/Show Any Section
Every content section is wrapped in `{condition && ...}`. Simply remove the condition to always show, or make it conditional on a flag.

---

## Testing Different Data

To test with different sample data, edit the listing page:

1. Open `src/pages/listing/[slug].astro`
2. Find the `const business = sampleBusiness;` line (~40)
3. Change to `const business = SAMPLE_RESTAURANT;` or other samples
4. Refresh your browser

---

## Next: Connect to Real Data

When ready to use real listings:

1. **Create the table in Supabase** (see LISTING_TEMPLATE_GUIDE.md)
2. **Update the page** to fetch from database:

```astro
---
// Replace this:
const business = sampleBusiness;

// With this:
import { SAMPLE_CAFE } from '../../data/sampleListings.js';
const { slug } = Astro.params;

const { data: business } = await supabase
    .from('listings')
    .select('*')
    .eq('slug', slug)
    .single();

if (!business) return Astro.redirect('/404');
---
```

3. **Add to navigation** from your homepage
4. **Create data entry form** for adding new listings

---

## Common Questions

**Q: How do I change which fields show?**
A: Each section is conditional. Remove the `{condition &&` to always show it.

**Q: Can I have different layouts for different types of businesses?**
A: Yes! See LISTING_TEMPLATE_GUIDE.md - Customization section for how to create separate templates.

**Q: How do I add more social platforms?**
A: Add `social_<platform>` field and the SocialLinks component will auto-detect it.

**Q: Can I customize the colors?**
A: All colors use existing CSS variables from global.css. Edit those to change everywhere at once.

**Q: The impressionist effect is too blurry/not blurry enough**
A: Adjust the `blur()` value (higher = more blurry). Try `blur(20px)` or `blur(60px)`.

---

## File Reference

| File | Purpose |
|------|---------|
| `src/pages/listing/[slug].astro` | Main page template |
| `src/components/SocialFeed.astro` | Social posts widget |
| `src/utils/listingHelpers.js` | Utility functions |
| `src/data/sampleListings.js` | Example data |
| `LISTING_TEMPLATE_GUIDE.md` | Full documentation |
| `LISTING_IMPLEMENTATION_SUMMARY.md` | What was built summary |

---

Enjoy your new listing page! 🎉
