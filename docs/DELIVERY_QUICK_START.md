# Delivery Links - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Add Database Columns (1 minute)
Go to your Supabase dashboard SQL editor and run:
```bash
scripts/add-delivery-platforms.sql
```

### 2. Update Your Listings (2 minutes)
Update one listing with delivery URLs:
```sql
UPDATE listings
SET delivery_deliveroo = 'https://deliveroo.co.uk/menu/bristol/city-centre/your-restaurant'
WHERE business_slug = 'your-restaurant';
```

### 3. Deploy the Code (1 minute)
The code is already updated! Just deploy normally.

### 4. Verify (1 minute)
Visit a listing page and look for "Order Online" section with delivery icons.

---

## 📋 What Was Changed

### New Components
- `src/components/DeliveryIcon.astro` - Icons for delivery platforms
- `src/components/DeliveryLinks.astro` - Display delivery platform links

### Updated Files
- `src/pages/listing/[slug].astro` - Shows delivery links in sidebar
- `src/data/sampleListings.js` - Added sample delivery URLs

### Database
- `scripts/add-delivery-platforms.sql` - Create new columns

---

## 🔗 Supported Platforms

| Platform | Format | Example |
|----------|--------|---------|
| **Deliveroo** | `https://deliveroo.co.uk/menu/...` | [View Example](https://deliveroo.co.uk) |
| **Uber Eats** | `https://www.ubereats.com/gb/...` | [View Example](https://ubereats.com) |
| **OpenTable** | `https://www.opentable.com/r/...` | [View Example](https://opentable.com) |

---

## 💡 Benefits

✅ **SEO** - Links to trusted platforms improve rankings  
✅ **Trust** - Users see your business on multiple platforms  
✅ **Conversions** - Easy ordering options increase sales  
✅ **Mobile** - Responsive design works on all devices  
✅ **Extensible** - Easy to add more platforms later  

---

## 🎨 Visual

The delivery links appear as icons under "Order Online" heading:

```
┌─────────────────────┐
│ Connect             │
│ [f] [📷] [𝕏]       │ (Social links)
│                     │
│ Order Online        │
│ [🍕] [🍔] [🪑]     │ (Delivery links)
└─────────────────────┘
```

---

## 📝 Database Column Names

```sql
delivery_deliveroo  -- VARCHAR, optional
delivery_ubereats   -- VARCHAR, optional  
delivery_opentable  -- VARCHAR, optional
```

---

## 🔧 How to Add More Platforms

Want to add Just Eat, Grubhub, or another platform?

1. **Edit `src/components/DeliveryIcon.astro`** - Add new icon SVG
2. **Edit `src/components/DeliveryLinks.astro`** - Add to platform list
3. **Run migration** - Add database column
4. **Update listing page** - Include new field

See `DELIVERY_LINKS_GUIDE.md` for details.

---

## ❓ FAQ

**Q: Do I need to add all three platforms?**  
A: No! Only add the ones your business uses. Empty links won't display.

**Q: How do I find my restaurant URLs?**  
A: Search for your business on each platform and copy the URL from the browser.

**Q: Will links change my site's ranking?**  
A: Yes, positively! Links to authority sites improve SEO.

**Q: Can I change the icon colors?**  
A: Yes! Edit the CSS variable `--powder-blush` or modify the component CSS.

**Q: Can I add more platforms?**  
A: Absolutely! See "How to Add More Platforms" section above.

---

## 📖 Full Documentation

- **Component Guide**: `DELIVERY_LINKS_GUIDE.md`
- **Implementation Details**: `DELIVERY_IMPLEMENTATION.md`

---

## ✨ That's It!

Your delivery links are now live. Monitor click-through rates in your analytics to see the impact!

Need help? Check the documentation files or review the implementation guide.
