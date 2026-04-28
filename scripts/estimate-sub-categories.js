/**
 * Script to estimate sub-categories from tags and image_category
 * Usage: node scripts/estimate-sub-categories.js
 * 
 * This script:
 * 1. Reads listings_rows-05.csv
 * 2. Uses tags and image_category to estimate sub_category
 * 3. Outputs enriched CSV with sub_category column
 */

import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

// Sub-category mappings extracted from TAG_TO_IMAGE_RULES
const TAG_TO_SUBCATEGORY = {
  // Sports & Recreation
  'climbing': 'Climbing',
  'sports_centre': 'Sports Centre',
  'karting': 'Karting',
  'padel': 'Padel',
  'outdoor': 'Outdoor Activities',
  'hiking': 'Hiking',
  'watersports': 'Watersports',
  'kayak': 'Kayaking',
  'cycling': 'Cycling',
  'bike_shop': 'Bike Shop',
  'sports_club': 'Sports Club',
  'rugby': 'Rugby',
  'football_club': 'Football Club',
  'tennis_club': 'Tennis Club',
  'leisure_centre': 'Leisure Centre',
  'golf': 'Golf',
  'golf_course': 'Golf Course',
  'swimming': 'Swimming',
  'pool': 'Pool',
  'swimming_pool': 'Swimming Pool',
  'gym': 'Gym',
  'fitness': 'Fitness',
  'crossfit': 'CrossFit',
  'personal_trainer': 'Personal Trainer',
  'fitness_centre': 'Fitness Centre',

  // Health & Wellbeing
  'massage': 'Massage',
  'therapist': 'Therapy',
  'physiotherapist': 'Physiotherapy',
  'beauty': 'Beauty',
  'cosmetics': 'Cosmetics',
  'clinic': 'Clinic',
  'medical_centre': 'Medical Centre',
  'health_centre': 'Health Centre',
  'herbalist': 'Herbalist',
  'acupuncture': 'Acupuncture',
  'chiropractor': 'Chiropractor',
  'osteopath': 'Osteopath',
  'dentist': 'Dentist',
  'dental': 'Dentist',
  'pharmacy': 'Pharmacy',
  'chemist': 'Chemist',
  'dispensary': 'Pharmacy',
  'sauna': 'Sauna',
  'spa': 'Spa',
  'steam_room': 'Sauna',
  'yoga': 'Yoga',
  'pilates': 'Pilates',
  'meditation': 'Meditation',
  'wellness': 'Wellness',
  'nail_salon': 'Nails',
  'nails': 'Nails',
  'manicure': 'Nails',
  'pedicure': 'Nails',
  'barbershop': 'Barber',
  'barber': 'Barber',
  'hairdresser': 'Hairdresser',
  'hair_salon': 'Hairdresser',
  'salon': 'Hairdresser',

  // Food & Produce
  'cheesemonger': 'Cheesemonger',
  'cheese': 'Cheesemonger',
  'deli': 'Deli',
  'delicatessen': 'Deli',
  'sweet_shop': 'Sweet Shop',
  'sweets': 'Sweet Shop',
  'confectionery': 'Sweet Shop',
  'candy': 'Sweet Shop',
  'bakery': 'Bakery',
  'cake': 'Bakery',
  'donut': 'Bakery',
  'flapjacks': 'Bakery',
  'supermarket': 'Supermarket',
  'greengrocer': 'Greengrocer',
  'produce': 'Greengrocer',
  'veg': 'Greengrocer',
  'vegetables': 'Greengrocer',
  'fruit': 'Greengrocer',
  'corner_shop': 'Convenience Store',
  'convenience_store': 'Convenience Store',
  'convenience': 'Convenience Store',
  'butcher': 'Butcher',
  'butchery': 'Butcher',
  'meat': 'Butcher',

  // Drinks & Brewing
  'wine_bar': 'Wine Bar',
  'wine': 'Wine Bar',
  'cocktail_bar': 'Cocktail Bar',
  'cellar': 'Wine Bar',
  'off_license': 'Off-License',
  'off_licence': 'Off-License',
  'bottle_shop': 'Off-License',
  'liquor_store': 'Off-License',
  'brewery': 'Brewery',
  'microbrewery': 'Brewery',
  'pub': 'Pub',
  'bar': 'Bar',
  'tavern': 'Pub',
  'taproom': 'Pub',

  // Cafes
  'cafe': 'Cafe',
  'coffee_shop': 'Coffee Shop',
  'coffee': 'Coffee Shop',
  'tea': 'Tea',
  'bubble_tea': 'Bubble Tea',
  'brunch': 'Brunch',
  'juice': 'Juice Bar',
  'sandwich': 'Sandwich Shop',

  // Restaurants - Cuisines
  'sushi': 'Sushi',
  'sashimi': 'Sushi',
  'ramen': 'Ramen',
  'noodle': 'Noodles',
  'pho': 'Pho',
  'korean': 'Korean',
  'pizza': 'Pizza',
  'burger': 'Burgers',
  'hamburger': 'Burgers',
  'chicken': 'Chicken',
  'kebab': 'Kebab',
  'shawarma': 'Kebab',
  'doner': 'Kebab',
  'falafel': 'Kebab',
  'middle_eastern': 'Middle Eastern',
  'lebanese': 'Middle Eastern',
  'tapas': 'Tapas',
  'spanish': 'Spanish',
  'iberian': 'Spanish',
  'indian': 'Indian',
  'south_asian': 'Indian',
  'thai': 'Thai',
  'southeast_asian': 'Thai',
  'chinese': 'Chinese',
  'dim_sum': 'Chinese',
  'vietnamese': 'Vietnamese',
  'asian': 'Asian',
  'mexican': 'Mexican',
  'latin': 'Latin American',
  'caribbean': 'Caribbean',
  'jamaican': 'Caribbean',
  'italian': 'Italian',
  'mediterranean': 'Mediterranean',
  'persian': 'Persian',
  'japanese': 'Japanese',
  'anime': 'Japanese',
  'turkish': 'Turkish',
  'turkish_kitchen': 'Turkish',
  'moroccan': 'Moroccan',
  'greek': 'Greek',
  'greek_kitchen': 'Greek',
  'fish_and_chips': 'Fish & Chips',
  'seafood': 'Seafood',
  'steak_house': 'Steakhouse',
  'ice_cream': 'Ice Cream',
  'frozen_yogurt': 'Frozen Yogurt',
  'dessert': 'Dessert',
  'pie': 'Pie',
  'restaurant': 'Restaurant',
  'fast_food': 'Fast Food',
  'takeaway': 'Takeaway',
  'breakfast': 'Breakfast',
  'british': 'British',
  'american': 'American',

  // Entertainment
  'cinema': 'Cinema',
  'theatre': 'Theatre',
  'theater': 'Theatre',
  'live_music': 'Live Music',
  'music_venue': 'Music Venue',
  'nightclub': 'Nightclub',
  'club': 'Nightclub',

  // Accommodation
  'hotel': 'Hotel',
  'hotel_chain': 'Hotel',
  'hostel': 'Hostel',
  'guest_house': 'Guest House',
  'bed_and_breakfast': 'B&B',
  'b&b': 'B&B',
  'airbnb': 'Airbnb',

  // Plants & Garden
  'florist': 'Florist',
  'flowers': 'Florist',
  'floristry': 'Florist',
  'garden_centre': 'Garden Centre',
  'nursery': 'Plant Nursery',
  'garden': 'Garden',
  'landscaping': 'Landscaping',
  'landscaper': 'Landscaping',
  'groundskeeper': 'Landscaping',
  'lawn': 'Lawn Care',

  // Craft & Makers
  'pottery': 'Pottery',
  'ceramics': 'Ceramics',
  'weaving': 'Weaving',
  'textiles': 'Textiles',
  'knitting': 'Knitting',
  'sewing': 'Sewing',
  'craft': 'Craft',

  // Art & Design
  'music_school': 'Music School',
  'music_academy': 'Music Academy',
  'music_studio': 'Music Studio',
  'dance_studio': 'Dance Studio',
  'dance': 'Dance',
  'dance_school': 'Dance School',
  'photography': 'Photography',
  'photographer': 'Photographer',
  'photography_studio': 'Photography Studio',
  'arts_centre': 'Arts Centre',
  'gallery': 'Gallery',
  'studio': 'Studio',
  'painter': 'Painter',
  'artist': 'Artist',

  // Retail & Fashion
  'shoes': 'Shoes',
  'shoe_shop': 'Shoes',
  'footwear': 'Shoes',
  'cobbler': 'Cobbler',
  'clothing': 'Clothing',
  'fashion': 'Fashion',
  'boutique': 'Boutique',
  'apparel': 'Apparel',
  'dress_shop': 'Dress Shop',
  'bookshop': 'Bookshop',
  'books': 'Bookshop',
  'stationery': 'Stationery',
  'book_store': 'Bookshop',

  // Home & Interiors
  'antiques': 'Antiques',
  'vintage': 'Vintage',
  'secondhand': 'Secondhand',
  'carpet': 'Carpet Shop',
  'carpet_shop': 'Carpet Shop',
  'rugs': 'Rugs',
  'flooring': 'Flooring',
  'lighting': 'Lighting',
  'lighting_shop': 'Lighting Shop',
  'lamps': 'Lighting',
  'paint_supplies': 'Paint Supplies',
  'paint_shop': 'Paint Shop',
  'decorating': 'Decorating',
  'tile_shop': 'Tile Shop',
  'tiles': 'Tiles',
  'tiling': 'Tiling',
  'sofa': 'Sofas',
  'sofa_shop': 'Sofas',
  'sofas': 'Sofas',
  'couch': 'Sofas',
  'interiors': 'Interiors',
  'furniture': 'Furniture',
  'home_goods': 'Home Goods',
  'homeware': 'Homeware',

  // Services
  'charity_shop': 'Charity Shop',
  'charity': 'Charity Shop',
  'thrift': 'Thrift',
  'dry_cleaning': 'Dry Cleaning',
  'tailor': 'Tailoring',
  'alterations': 'Alterations',
  'launderette': 'Launderette',
  'laundromat': 'Launderette',
  'laundrette': 'Launderette',
  'laundry': 'Laundry',
  'jewelry': 'Jewelry',
  'jeweller': 'Jewelry',
  'jewelry_store': 'Jewelry',
  'nutrition_supplements': 'Nutrition Supplements',
  'interior_decoration': 'Interior Decoration',
};

// Image category to sub-category fallback
const IMAGE_CATEGORY_TO_SUBCATEGORY = {
  'hairdresser': 'Hairdresser',
  'cafe': 'Cafe',
  'ice-cream': 'Ice Cream',
  'greengrocer': 'Greengrocer',
  'restaurant': 'Restaurant',
  'pub': 'Pub',
  'corner-shop': 'Convenience Store',
  'dentist': 'Dentist',
  'pharmacy': 'Pharmacy',
  'wine-bar': 'Wine Bar',
  'bakery': 'Bakery',
  'pizza': 'Pizza',
  'burger': 'Burgers',
  'noodle': 'Noodles',
  'sushi': 'Sushi',
  'chinese': 'Chinese',
  'thai': 'Thai',
  'indian': 'Indian',
  'mexican': 'Mexican',
  'italian': 'Italian',
  'yoga': 'Yoga',
  'massage': 'Massage',
  'nail-salon': 'Nails',
  'barbershop': 'Barber',
  'antiques': 'Antiques',
  'carpet-shop': 'Carpet Shop',
  'lighting-shop': 'Lighting Shop',
  'paint-supplies': 'Paint Supplies',
  'tile-shop': 'Tile Shop',
  'sofa-shop': 'Sofas',
  'home': 'Home & Interiors',
  'tailors': 'Tailoring',
  'launderette': 'Launderette',
};

function normaliseTag(tag) {
  return tag.toLowerCase().replace(/[_-]/g, '');
}

function estimateSubCategory(tags, imageCategory, categorySlug) {
  // Priority 1: Match tags to TAG_TO_SUBCATEGORY
  if (Array.isArray(tags) && tags.length > 0) {
    for (const tag of tags) {
      const subCat = TAG_TO_SUBCATEGORY[tag];
      if (subCat) return subCat;
    }
  }

  // Priority 2: Use image_category if available
  if (imageCategory) {
    const subCat = IMAGE_CATEGORY_TO_SUBCATEGORY[imageCategory];
    if (subCat) return subCat;
  }

  // Priority 3: Use category_slug as fallback
  if (categorySlug) {
    return categorySlug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  return null;
}

async function processListings() {
  console.log('📊 Estimating Sub-Categories\n');

  const csvPath = './db_backup./listings_rows-05.csv';
  const outputPath = './db_backup./listings_rows-05-with-subcategory.csv';

  try {
    // Read CSV
    console.log(`📖 Reading: ${csvPath}`);
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
    });

    console.log(`✅ Loaded ${records.length} listings\n`);

    // Process each record
    let withSubCat = 0;
    let tagMatches = 0;
    let imageMatches = 0;
    let fallbackMatches = 0;

    const enrichedRecords = records.map((record) => {
      let tags = [];
      try {
        tags = JSON.parse(record.tags || '[]');
      } catch (e) {
        tags = [];
      }

      const subCategory = estimateSubCategory(
        tags,
        record.image_category,
        record.category_slug
      );

      if (subCategory) {
        withSubCat++;
        // Track which method matched
        if (Array.isArray(tags) && tags.length > 0) {
          for (const tag of tags) {
            if (TAG_TO_SUBCATEGORY[tag]) {
              tagMatches++;
              break;
            }
          }
        } else if (record.image_category && IMAGE_CATEGORY_TO_SUBCATEGORY[record.image_category]) {
          imageMatches++;
        } else {
          fallbackMatches++;
        }
      }

      return {
        ...record,
        sub_category: subCategory || '',
      };
    });

    // Output new CSV
    console.log(`📝 Writing enriched CSV to: ${outputPath}`);
    const csvOutput = stringify(enrichedRecords, { header: true });
    fs.writeFileSync(outputPath, csvOutput);

    // Print statistics
    console.log(`\n📊 RESULTS:`);
    console.log(`  Total listings: ${records.length}`);
    console.log(`  With sub-category: ${withSubCat}`);
    console.log(`  Without sub-category: ${records.length - withSubCat}`);
    console.log(`\n📌 Match method breakdown:`);
    console.log(`  Tag-based matches: ${tagMatches}`);
    console.log(`  Image-category matches: ${imageMatches}`);
    console.log(`  Fallback matches: ${fallbackMatches}`);

    console.log(`\n✅ Done! New file created with sub_category column.\n`);

    // Print sample results
    console.log(`📋 Sample results (first 10):`);
    console.log('');
    enrichedRecords.slice(0, 10).forEach((r, i) => {
      console.log(`${i + 1}. ${r.name}`);
      console.log(`   Category: ${r.category_slug}`);
      console.log(`   Tags: ${r.tags}`);
      console.log(`   Sub-category: ${r.sub_category}`);
      console.log('');
    });
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

processListings();