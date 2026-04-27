#!/usr/bin/env node
/**
 * Check if listings can find proper illustrations based on their tags
 * Uses the actual TAG_TO_IMAGE_RULES from categoryImages.js
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Copy of TAG_TO_IMAGE_RULES from categoryImages.js
const TAG_TO_IMAGE_RULES = [
  { tags: ['climbing', 'climbing_wall'], prefix: 'sports-and-recreation/climbing' },
  { tags: ['sports_centre'], prefix: 'sports-and-recreation/sports-centre' },
  { tags: ['karting', 'go_kart', 'kart_racing'], prefix: 'sports-and-recreation/karting' },
  { tags: ['padel', 'padel_tennis'], prefix: 'sports-and-recreation/padel' },
  { tags: ['outdoor', 'outdoor_activities', 'hiking'], prefix: 'sports-and-recreation/outdoor' },
  { tags: ['watersports', 'kayak', 'canoeing', 'sailing'], prefix: 'sports-and-recreation/watersports' },
  { tags: ['cycling', 'bike_shop', 'bicycle'], prefix: 'sports-and-recreation/cycling' },
  { tags: ['sports_club', 'rugby', 'football_club', 'tennis_club'], prefix: 'sports-and-recreation/sports-club' },
  { tags: ['leisure_centre', 'leisure_center'], prefix: 'sports-and-recreation/leisure-centre' },
  { tags: ['golf', 'golf_course'], prefix: 'sports-and-recreation/golf-course' },
  { tags: ['swimming', 'pool', 'swimming_pool'], prefix: 'sports-and-recreation/swimming-pool' },
  { tags: ['gym', 'fitness', 'crossfit', 'personal_trainer', 'fitness_centre'], prefix: 'sports-and-recreation/fitness-studio' },
  { tags: ['massage', 'therapist', 'physiotherapist'], prefix: 'health-and-wellbeing/massage' },
  { tags: ['beauty', 'cosmetics'], prefix: 'health-and-wellbeing/hairdresser' },
  { tags: ['clinic', 'medical_centre', 'health_centre'], prefix: 'health-and-wellbeing/dentist' },
  { tags: ['herbalist', 'herbalism'], prefix: 'health-and-wellbeing/pharmacy' },
  { tags: ['acupuncture'], prefix: 'health-and-wellbeing/acupuncture' },
  { tags: ['chiropractor'], prefix: 'health-and-wellbeing/chiropractor' },
  { tags: ['osteopath'], prefix: 'health-and-wellbeing/osteopath' },
  { tags: ['dentist', 'dental'], prefix: 'health-and-wellbeing/dentist' },
  { tags: ['pharmacy', 'chemist', 'dispensary'], prefix: 'health-and-wellbeing/pharmacy' },
  { tags: ['sauna', 'spa', 'steam_room'], prefix: 'health-and-wellbeing/sauna' },
  { tags: ['yoga', 'pilates', 'meditation', 'wellness'], prefix: 'health-and-wellbeing/yoga' },
  { tags: ['nail_salon', 'nails', 'manicure', 'pedicure'], prefix: 'health-and-wellbeing/nail-salon' },
  { tags: ['barbershop', 'barber'], prefix: 'health-and-wellbeing/barbershop' },
  { tags: ['hairdresser', 'hair_salon', 'salon'], prefix: 'health-and-wellbeing/hairdresser' },
  { tags: ['cheesemonger', 'cheese'], prefix: 'food-and-produce/cheesemonger' },
  { tags: ['deli', 'delicatessen'], prefix: 'food-and-produce/deli' },
  { tags: ['sweet_shop', 'sweets', 'confectionery', 'candy'], prefix: 'food-and-produce/sweet-shop' },
  { tags: ['bakery', 'cake', 'donut', 'flapjacks'], prefix: 'food-and-produce/bakery' },
  { tags: ['supermarket'], prefix: 'food-and-produce/supermarket' },
  { tags: ['greengrocer', 'produce', 'veg', 'vegetables', 'fruit'], prefix: 'food-and-produce/greengrocer' },
  { tags: ['corner_shop', 'convenience_store', 'convenience'], prefix: 'food-and-produce/corner-shop' },
  { tags: ['butcher', 'butchery', 'meat'], prefix: 'food-and-produce/deli' },
  { tags: ['wine_bar', 'wine', 'cocktail_bar', 'cellar'], prefix: 'drinks-and-brewing/wine-bar' },
  { tags: ['off_license', 'off_licence', 'bottle_shop', 'liquor_store'], prefix: 'drinks-and-brewing/off-license' },
  { tags: ['brewery', 'microbrewery'], prefix: 'drinks-and-brewing/brewery' },
  { tags: ['pub', 'bar', 'tavern', 'taproom'], prefix: 'drinks-and-brewing/pub' },
  { tags: ['cafe', 'coffee_shop', 'coffee', 'tea', 'bubble_tea', 'brunch', 'juice', 'sandwich'], prefix: 'cafes/cafe' },
  { tags: ['sushi', 'sashimi'], prefix: 'restaurants/sushi' },
  { tags: ['ramen', 'noodle', 'pho', 'korean'], prefix: 'restaurants/noodle' },
  { tags: ['pizza'], prefix: 'restaurants/pizza' },
  { tags: ['burger', 'hamburger', 'chicken'], prefix: 'restaurants/burger' },
  { tags: ['kebab', 'shawarma', 'doner', 'falafel', 'middle_eastern', 'lebanese'], prefix: 'restaurants/kebab' },
  { tags: ['tapas', 'spanish', 'iberian'], prefix: 'restaurants/tapas' },
  { tags: ['indian', 'south_asian'], prefix: 'restaurants/indian' },
  { tags: ['thai', 'southeast_asian'], prefix: 'restaurants/thai' },
  { tags: ['chinese', 'dim_sum'], prefix: 'restaurants/chinese' },
  { tags: ['vietnamese', 'asian'], prefix: 'restaurants/asian' },
  { tags: ['mexican', 'latin', 'caribbean', 'jamaican'], prefix: 'restaurants/mexican' },
  { tags: ['italian', 'mediterranean', 'persian'], prefix: 'restaurants/italian' },
  { tags: ['japanese', 'anime'], prefix: 'restaurants/japanese' },
  { tags: ['turkish', 'turkish_kitchen', 'moroccan'], prefix: 'restaurants/turkish' },
  { tags: ['greek', 'greek_kitchen'], prefix: 'restaurants/greek' },
  { tags: ['fish_and_chips', 'seafood', 'steak_house'], prefix: 'restaurants/fish-and-chips' },
  { tags: ['ice_cream', 'frozen_yogurt', 'dessert', 'pie'], prefix: 'restaurants/ice-cream' },
  { tags: ['restaurant', 'fast_food', 'takeaway', 'breakfast', 'british', 'american'], prefix: 'restaurants/restaurant' },
  { tags: ['cinema'], prefix: 'entertainment/cinema' },
  { tags: ['theatre', 'theater'], prefix: 'entertainment/theater' },
  { tags: ['live_music', 'music_venue'], prefix: 'entertainment/live-music' },
  { tags: ['nightclub', 'club'], prefix: 'entertainment/nightclub' },
  { tags: ['hotel', 'hotel_chain'], prefix: 'accommodation/hotel' },
  { tags: ['hostel', 'guest_house', 'bed_and_breakfast', 'b&b', 'airbnb'], prefix: 'accommodation/hostel' },
  { tags: ['florist', 'flowers', 'floristry'], prefix: 'plants-and-garden/florist' },
  { tags: ['garden_centre', 'nursery', 'garden'], prefix: 'plants-and-garden/garden-centre' },
  { tags: ['landscaping', 'landscaper', 'groundskeeper', 'lawn'], prefix: 'plants-and-garden/landscaping' },
  { tags: ['pottery', 'ceramics'], prefix: 'craft-and-makers/pottery' },
  { tags: ['weaving', 'textiles', 'knitting', 'sewing'], prefix: 'craft-and-makers/weaver' },
  { tags: ['music_school', 'music_academy', 'music_studio'], prefix: 'art-and-design/music' },
  { tags: ['dance_studio', 'dance', 'dance_school'], prefix: 'art-and-design/dance-studio' },
  { tags: ['photography', 'photographer', 'photography_studio'], prefix: 'art-and-design/photography-studio' },
  { tags: ['arts_centre', 'gallery', 'studio'], prefix: 'art-and-design/gallery' },
  { tags: ['painter', 'artist'], prefix: 'art-and-design/painter' },
  { tags: ['shoes', 'shoe_shop', 'footwear', 'cobbler'], prefix: 'retail-and-fashion/shoes' },
  { tags: ['clothing', 'fashion', 'boutique', 'apparel', 'dress_shop'], prefix: 'retail-and-fashion/clothing' },
  { tags: ['bookshop', 'books', 'stationery', 'book_store'], prefix: 'retail-and-fashion/bookshop' },
  { tags: ['jewelry', 'jeweller', 'jewelry_store'], prefix: 'retail-and-fashion/shoes' },
  { tags: ['antiques', 'vintage', 'secondhand'], prefix: 'home-and-interiors/antiques' },
  { tags: ['carpet', 'carpet_shop', 'rugs', 'flooring'], prefix: 'home-and-interiors/carpet-shop' },
  { tags: ['lighting', 'lighting_shop', 'lamps'], prefix: 'home-and-interiors/lighting-shop' },
  { tags: ['paint_supplies', 'paint_shop', 'decorating'], prefix: 'home-and-interiors/paint-supplies' },
  { tags: ['tile_shop', 'tiles', 'tiling'], prefix: 'home-and-interiors/tile-shop' },
  { tags: ['sofa', 'sofa_shop', 'sofas', 'couch'], prefix: 'home-and-interiors/sofa-shop' },
  { tags: ['interiors', 'furniture', 'home_goods', 'homeware'], prefix: 'home-and-interiors/home' },
  { tags: ['charity_shop', 'charity', 'thrift'], prefix: 'services/charity-shop' },
  { tags: ['dry_cleaning'], prefix: 'services/dry-cleaning' },
  { tags: ['tailor', 'alterations'], prefix: 'services/tailors' },
  { tags: ['launderette', 'laundromat', 'laundrette', 'laundry'], prefix: 'services/launderette' },
];

function normaliseTag(tag) {
  return tag.toLowerCase().replace(/[_-]/g, '');
}

function findMatchingRule(tags) {
  if (!Array.isArray(tags) || tags.length === 0) return null;
  
  const normalisedListingTags = tags.map(normaliseTag);
  for (const rule of TAG_TO_IMAGE_RULES) {
    const normalisedRuleTags = rule.tags.map(normaliseTag);
    if (normalisedListingTags.some(lt => normalisedRuleTags.includes(lt))) {
      return rule.prefix;
    }
  }
  return null;
}

async function analyzeListings() {
  console.log('Analyzing listings for image availability...\n');
  
  // Paginate through all listings
  const PAGE_SIZE = 1000;
  let allListings = [];
  let from = 0;
  while (true) {
    const { data: pageData } = await supabase
      .from('listings')
      .select('id, name, category_slug, tags')
      .range(from, from + PAGE_SIZE - 1);
    
    if (!pageData || pageData.length === 0) break;
    allListings = allListings.concat(pageData);
    if (pageData.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }
  
  console.log(`Analyzing ${allListings.length} listings\n`);
  
  const categoryStats = {};
  const withoutMatch = [];
  const withMatch = [];
  
  for (const listing of allListings) {
    const match = findMatchingRule(listing.tags);
    const cat = listing.category_slug || 'unknown';
    
    if (!categoryStats[cat]) {
      categoryStats[cat] = { total: 0, matched: 0, unmatched: 0, listings: [] };
    }
    categoryStats[cat].total++;
    
    if (match) {
      categoryStats[cat].matched++;
      if (withMatch.length < 5) {
        withMatch.push({ name: listing.name, tags: listing.tags, match });
      }
    } else {
      categoryStats[cat].unmatched++;
      if (withoutMatch.length < 20) {
        withoutMatch.push({ 
          id: listing.id,
          name: listing.name, 
          category_slug: cat, 
          tags: listing.tags 
        });
      }
    }
  }
  
  console.log('Coverage by category:\n');
  Object.entries(categoryStats)
    .sort((a, b) => b[1].unmatched - a[1].unmatched)
    .forEach(([cat, stats]) => {
      const coverage = Math.round(stats.matched * 100 / stats.total);
      const bar = '█'.repeat(Math.round(coverage / 5)) + '░'.repeat(20 - Math.round(coverage / 5));
      console.log(`  ${cat.padEnd(25)} ${bar} ${coverage}% (${stats.matched}/${stats.total})`);
    });
  
  console.log(`\n⚠️  ${withoutMatch.length} example listings without image matches:\n`);
  
  withoutMatch.forEach(listing => {
    console.log(`\nName: ${listing.name}`);
    console.log(`Category: ${listing.category_slug}`);
    console.log(`Tags: ${Array.isArray(listing.tags) ? listing.tags.join(', ') : listing.tags}`);
    console.log(`Suggestion: Add a tag from the category hints`);
  });
  
  const totalWithoutMatch = Object.values(categoryStats).reduce((sum, s) => sum + s.unmatched, 0);
  console.log(`\n✅ Total unmatched: ${totalWithoutMatch} listings`);
}

analyzeListings().catch(console.error);
