#!/usr/bin/env node
/**
 * Check listing tags against image category rules
 * Ensures all listings can find appropriate illustrations
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Mapping of category slugs to expected tag categories
const CATEGORY_TAG_HINTS = {
  'cafes': ['cafe', 'coffee_shop', 'coffee', 'tea', 'bubble_tea', 'brunch', 'juice'],
  'restaurants': ['restaurant', 'fast_food', 'takeaway', 'ice_cream', 'sushi', 'pizza', 'burger'],
  'food-and-produce': ['greengrocer', 'bakery', 'deli', 'cheesemonger', 'supermarket', 'corner_shop'],
  'drinks-and-brewing': ['pub', 'bar', 'wine_bar', 'brewery', 'off_license'],
  'health-and-wellbeing': ['massage', 'yoga', 'pharmacy', 'dentist', 'hairdresser', 'barbershop', 'sauna', 'spa'],
  'sports-and-recreation': ['gym', 'fitness', 'swimming', 'golf', 'climbing', 'sports_centre', 'cycling', 'sports_club'],
  'entertainment': ['cinema', 'theatre', 'live_music', 'nightclub'],
  'accommodation': ['hotel', 'hostel', 'bed_and_breakfast'],
  'art-and-design': ['gallery', 'photography', 'dance_studio', 'music_school', 'painter', 'artist'],
  'craft-and-makers': ['pottery', 'weaving', 'sewing'],
  'plants-and-garden': ['florist', 'garden_centre', 'landscaping'],
  'home-and-interiors': ['antiques', 'furniture', 'lighting', 'carpet'],
  'services': ['launderette', 'dry_cleaning', 'tailor', 'charity_shop'],
  'retail-and-fashion': ['clothing', 'shoes', 'bookshop', 'boutique'],
};

async function checkListingTags() {
  console.log('Checking all listings for tag-based image matching...\n');
  
  // Paginate to fetch all listings
  const PAGE_SIZE = 1000;
  let allListings = [];
  let from = 0;
  while (true) {
    const { data: pageData } = await supabase
      .from('listings')
      .select('id, name, category_slug, tags, image_category')
      .range(from, from + PAGE_SIZE - 1);
    
    if (!pageData || pageData.length === 0) break;
    allListings = allListings.concat(pageData);
    if (pageData.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }
  
  console.log(`Checking ${allListings.length} listings\n`);
  
  const issues = [];
  const byCategory = {};
  
  for (const listing of allListings) {
    if (!listing.category_slug) continue;
    
    if (!byCategory[listing.category_slug]) {
      byCategory[listing.category_slug] = { total: 0, withoutTags: 0, listings: [] };
    }
    byCategory[listing.category_slug].total++;
    
    const tags = Array.isArray(listing.tags) ? listing.tags : [];
    
    // Check if listing has tags
    if (tags.length === 0) {
      byCategory[listing.category_slug].withoutTags++;
      issues.push({
        id: listing.id,
        name: listing.name,
        category_slug: listing.category_slug,
        issue: 'No tags found',
        suggestion: CATEGORY_TAG_HINTS[listing.category_slug]?.[0] || 'Add relevant tag'
      });
    } else {
      // Check if tags match category expectations
      const hints = CATEGORY_TAG_HINTS[listing.category_slug] || [];
      const hasRelevantTag = tags.some(t => hints.includes(t));
      
      if (!hasRelevantTag && tags.length < 3) {
        issues.push({
          id: listing.id,
          name: listing.name,
          category_slug: listing.category_slug,
          currentTags: tags,
          issue: 'Tags may not match illustrations',
          suggestion: hints[0]
        });
      }
    }
    
    byCategory[listing.category_slug].listings.push({
      name: listing.name,
      tags: tags.length
    });
  }
  
  console.log('Summary by category:\n');
  Object.entries(byCategory).sort().forEach(([cat, data]) => {
    const pct = data.withoutTags > 0 
      ? ` (${Math.round(data.withoutTags * 100 / data.total)}% without tags)` 
      : '';
    console.log(`  ${cat}: ${data.total} listings${pct}`);
  });
  
  console.log(`\n⚠️  Found ${issues.length} listings with potential tag issues:\n`);
  
  issues.slice(0, 30).forEach(issue => {
    console.log(`\nID: ${issue.id}`);
    console.log(`Name: ${issue.name}`);
    console.log(`Category: ${issue.category_slug}`);
    console.log(`Issue: ${issue.issue}`);
    if (issue.currentTags) {
      console.log(`Current tags: ${issue.currentTags.join(', ')}`);
    }
    console.log(`Suggestion: Add tag "${issue.suggestion}"`);
  });
  
  if (issues.length > 30) {
    console.log(`\n... and ${issues.length - 30} more issues`);
  }
  
  console.log(`\n✅ Analysis complete. ${issues.length} issues found.`);
}

checkListingTags().catch(console.error);
