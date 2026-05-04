# Delivery Platform Links Implementation

## Overview

This feature adds support for displaying Deliveroo, Uber Eats, and OpenTable links on business listing pages. The links appear in a dedicated "Order Online" section beneath the social media links in the sidebar.

## Features

- **Conditional Display**: Links only show if they exist in the database
- **SEO Benefits**: Improves search visibility and helps with local SEO
- **User Confidence**: Users can verify the business on trusted platforms and place orders
- **Extensible**: Designed to easily add more delivery platforms (e.g., Just Eat, Grubhub)

## Database Setup

### Adding Columns to Supabase

Run the SQL migration script in Supabase:
```bash
# In Supabase SQL Editor, run:
scripts/add-delivery-platforms.sql
```

This adds three new optional columns to the `listings` table:
- `delivery_deliveroo`: Deliveroo URL
- `delivery_ubereats`: Uber Eats URL
- `delivery_opentable`: OpenTable URL

### Example Data

```sql
-- Update a listing with delivery platform links
UPDATE listings
SET 
  delivery_deliveroo = 'https://deliveroo.co.uk/menu/bristol/city-centre/restaurant-name',
  delivery_ubereats = 'https://www.ubereats.com/gb/restaurant/restaurant-name',
  delivery_opentable = 'https://www.opentable.com/r/restaurant-name-bristol'
WHERE business_slug = 'restaurant-name';
```

## Components

### DeliveryIcon Component
Located: `/src/components/DeliveryIcon.astro`

Renders delivery platform icons. Supports:
- `deliveroo`
- `ubereats`
- `opentable`

Usage:
```astro
<DeliveryIcon platform="deliveroo" size={18} />
```

### DeliveryLinks Component
Located: `/src/components/DeliveryLinks.astro`

Displays a list of delivery platform links for a listing.

**Props:**
- `listing`: The listing object containing delivery URLs
- `small` (optional): Boolean to use smaller icons/spacing (default: false)

**Features:**
- Automatically filters out null/empty links
- Opens links in new tab (`target="_blank"`)
- Includes proper rel attributes for security
- Has hover effects and animations
- Responsive design with touch-friendly targets

**Styles:**
- Uses color scheme: `--powder-blush` (main color)
- Uses spacing variables: `--space-md`, `--space-sm`
- Hover state: raises button slightly with better background

Usage in template:
```astro
<DeliveryLinks listing={business} />
```

## Listing Page Updates

The listing page has been updated to:

1. Import the `DeliveryLinks` component
2. Fetch delivery platform fields from Supabase
3. Add delivery fields to the business object
4. Display delivery links in a new "Order Online" section if any links exist

The section appears under the "Connect" widget and only shows if at least one delivery platform link is available.

## Future Additions

The implementation is designed to be easily extended. To add more platforms:

1. Add a new icon to `DeliveryIcon.astro`:
   ```astro
   justeat: `<svg ...></svg>`,
   ```

2. Add a new entry to the filter array in `DeliveryLinks.astro`:
   ```astro
   { key: 'delivery_justeat', platform: 'justeat', label: 'Just Eat' },
   ```

3. Add database column:
   ```sql
   ALTER TABLE listings ADD COLUMN delivery_justeat VARCHAR;
   ```

4. Update listing page to include the field in the select query

## SEO Considerations

- Delivery links are indexed by search engines
- Links to trusted platforms (Deliveroo, Uber Eats, OpenTable) improve domain authority
- User engagement signals (clicks to delivery platforms) may improve search rankings
- Links should be to the actual business profile, not generic search results

## URL Formats

### Deliveroo
- Format: `https://deliveroo.co.uk/menu/[city]/[area]/[restaurant-name]`
- Example: `https://deliveroo.co.uk/menu/bristol/city-centre/pizzeria-uno`
- Can also use: `https://deliveroo.co.uk/menu/Bristol/southmead-and-henbury/snd-oriental-shop-ltd?day=today`

### Uber Eats
- Format: `https://www.ubereats.com/gb/store/[restaurant-name]/[id]`
- Example: `https://www.ubereats.com/gb/store/pizzeria-uno/ReDQZyDYS1COLdM8_HQPLw`

### OpenTable
- Format: `https://www.opentable.com/r/[restaurant-name]-[city]`
- Example: `https://www.opentable.com/r/pizzeria-uno-bristol`
- May need specific configuration per restaurant

## Testing

To test the feature:

1. Update a listing with delivery platform URLs:
   ```sql
   UPDATE listings
   SET delivery_deliveroo = 'https://deliveroo.co.uk/menu/bristol/city-centre/test-restaurant'
   WHERE business_slug = 'test-restaurant';
   ```

2. Navigate to the listing page and verify links appear in the sidebar

3. Test that links open correctly in new tabs

4. Test that the section hides when no delivery links are available

## Styling Notes

- Icons use CSS `fill: currentColor` for easy color control
- Links inherit the `--powder-blush` color from CSS variables
- Responsive design adapts for mobile (buttons remain touch-friendly)
- Hover states provide visual feedback
- Border/background uses `--parchment` color with rgba transparency

## Database Indexing

Indexes have been created on the delivery columns for faster queries when filtering by delivery platform availability.
