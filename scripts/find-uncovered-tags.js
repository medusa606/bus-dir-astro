#!/usr/bin/env node
/**
 * Identify missing tags that need to be added to TAG_TO_IMAGE_RULES
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Existing tags in TAG_TO_IMAGE_RULES
const COVERED_TAGS = new Set([
  'climbing', 'climbing_wall', 'sports_centre', 'karting', 'go_kart', 'kart_racing',
  'padel', 'padel_tennis', 'outdoor', 'outdoor_activities', 'hiking', 'watersports',
  'kayak', 'canoeing', 'sailing', 'cycling', 'bike_shop', 'bicycle', 'sports_club',
  'rugby', 'football_club', 'tennis_club', 'leisure_centre', 'leisure_center',
  'golf', 'golf_course', 'swimming', 'pool', 'swimming_pool', 'gym', 'fitness',
  'crossfit', 'personal_trainer', 'massage', 'therapist', 'acupuncture',
  'chiropractor', 'osteopath', 'dentist', 'dental', 'pharmacy', 'chemist',
  'dispensary', 'sauna', 'spa', 'steam_room', 'yoga', 'pilates', 'meditation',
  'wellness', 'nail_salon', 'nails', 'manicure', 'pedicure', 'barbershop', 'barber',
  'hairdresser', 'hair_salon', 'salon', 'cheesemonger', 'cheese', 'deli',
  'delicatessen', 'sweet_shop', 'sweets', 'confectionery', 'candy', 'bakery',
  'cake', 'donut', 'flapjacks', 'supermarket', 'greengrocer', 'produce', 'veg',
  'vegetables', 'fruit', 'corner_shop', 'convenience_store', 'wine_bar', 'wine',
  'cocktail_bar', 'cellar', 'off_license', 'off_licence', 'bottle_shop', 'liquor_store',
  'brewery', 'microbrewery', 'pub', 'bar', 'tavern', 'taproom', 'cafe', 'coffee_shop',
  'coffee', 'tea', 'bubble_tea', 'brunch', 'juice', 'sushi', 'sashimi', 'ramen',
  'noodle', 'pho', 'pizza', 'burger', 'hamburger', 'kebab', 'shawarma', 'doner',
  'tapas', 'spanish', 'indian', 'thai', 'chinese', 'vietnamese', 'asian', 'mexican',
  'italian', 'japanese', 'turkish', 'turkish_kitchen', 'greek', 'greek_kitchen',
  'fish_and_chips', 'ice_cream', 'frozen_yogurt', 'dessert', 'restaurant', 'fast_food',
  'takeaway', 'cinema', 'theatre', 'theater', 'live_music', 'music_venue', 'nightclub',
  'club', 'hotel', 'hotel_chain', 'hostel', 'guest_house', 'bed_and_breakfast', 'b&b',
  'airbnb', 'florist', 'flowers', 'floristry', 'garden_centre', 'nursery', 'garden',
  'landscaping', 'landscaper', 'groundskeeper', 'lawn', 'pottery', 'ceramics',
  'weaving', 'textiles', 'knitting', 'sewing', 'music_school', 'music_academy',
  'music_studio', 'dance_studio', 'dance', 'dance_school', 'photography', 'photographer',
  'photography_studio', 'arts_centre', 'gallery', 'studio', 'painter', 'artist',
  'shoes', 'shoe_shop', 'footwear', 'cobbler', 'clothing', 'fashion', 'boutique',
  'apparel', 'dress_shop', 'bookshop', 'books', 'stationery', 'book_store', 'antiques',
  'vintage', 'secondhand', 'carpet', 'carpet_shop', 'rugs', 'flooring', 'lighting',
  'lighting_shop', 'lamps', 'paint_supplies', 'paint_shop', 'decorating', 'tile_shop',
  'tiles', 'tiling', 'sofa', 'sofa_shop', 'sofas', 'couch', 'interiors', 'furniture',
  'home_goods', 'homeware', 'charity_shop', 'charity', 'thrift', 'dry_cleaning', 'tailor',
  'alterations', 'launderette', 'laundromat', 'laundrette'
]);

async function findMissingTags() {
  console.log('Finding tags not covered by image rules...\n');
  
  const allTags = new Map(); // tag -> count
  
  // Paginate through all listings
  const PAGE_SIZE = 1000;
  let from = 0;
  while (true) {
    const { data: pageData } = await supabase
      .from('listings')
      .select('tags')
      .range(from, from + PAGE_SIZE - 1);
    
    if (!pageData || pageData.length === 0) break;
    
    for (const listing of pageData) {
      if (Array.isArray(listing.tags)) {
        for (const tag of listing.tags) {
          if (typeof tag === 'string') {
            const normalised = tag.toLowerCase().trim();
            allTags.set(normalised, (allTags.get(normalised) || 0) + 1);
          }
        }
      }
    }
    
    if (pageData.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }
  
  console.log(`Total unique tags found: ${allTags.size}\n`);
  
  const uncovered = Array.from(allTags.entries())
    .filter(([tag]) => !COVERED_TAGS.has(tag))
    .sort((a, b) => b[1] - a[1]);
  
  console.log(`Uncovered tags: ${uncovered.length}\n`);
  console.log('Top 50 uncovered tags by frequency:\n');
  
  uncovered.slice(0, 50).forEach(([tag, count], idx) => {
    console.log(`  ${String(idx + 1).padStart(2)}. ${tag.padEnd(25)} (${count} listings)`);
  });
  
  if (uncovered.length > 50) {
    console.log(`\n... and ${uncovered.length - 50} more uncovered tags`);
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`  Total unique tags: ${allTags.size}`);
  console.log(`  Covered by rules: ${COVERED_TAGS.size}`);
  console.log(`  Uncovered: ${uncovered.length} (${Math.round(uncovered.length * 100 / allTags.size)}%)`);
}

findMissingTags().catch(console.error);
