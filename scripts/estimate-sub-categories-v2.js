import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse as parseCsv } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Direct tag → sub-category mapping (extracted from categoryImages.js TAG_TO_IMAGE_RULES)
const TAG_TO_SUBCATEGORY = {
  // Restaurants - cuisines
  'sushi': 'Sushi',
  'pizza': 'Pizza',
  'burger': 'Burgers',
  'chinese': 'Chinese',
  'thai': 'Thai',
  'indian': 'Indian',
  'mexican': 'Mexican',
  'italian': 'Italian',
  'french': 'French',
  'spanish': 'Spanish',
  'japanese': 'Japanese',
  'korean': 'Korean',
  'vietnamese': 'Vietnamese',
  'turkish': 'Turkish',
  'greek': 'Greek',
  'portuguese': 'Portuguese',
  'brazilian': 'Brazilian',
  'argentinian': 'Argentinian',
  'lebanese': 'Lebanese',
  'moroccan': 'Moroccan',
  'fish_and_chips': 'Fish & Chips',
  'fish': 'Fish',
  'noodle': 'Noodles',
  'ramen': 'Ramen',
  'pasta': 'Pasta',
  'tapas': 'Tapas',
  'seafood': 'Seafood',
  'steak': 'Steak',
  'bbq': 'BBQ',
  'barbeque': 'BBQ',
  'barbecue': 'BBQ',
  'chicken': 'Chicken',
  'vegetarian': 'Vegetarian',
  'vegan': 'Vegan',
  'gluten_free': 'Gluten Free',
  
  // Health & Wellbeing
  'yoga': 'Yoga',
  'pilates': 'Pilates',
  'massage': 'Massage',
  'spa': 'Spa',
  'sauna': 'Sauna',
  'dentist': 'Dentist',
  'pharmacy': 'Pharmacy',
  'gym': 'Gym',
  'fitness': 'Fitness',
  'swimming': 'Swimming',
  'acupuncture': 'Acupuncture',
  'chiropractor': 'Chiropractor',
  'osteopath': 'Osteopath',
  'hairdresser': 'Hairdresser',
  'barber': 'Barber',
  'nail_salon': 'Nail Salon',
  
  // Home & Interiors
  'furniture': 'Furniture',
  'antiques': 'Antiques',
  'homeware': 'Homeware',
  'interior_design': 'Interior Design',
  'kitchen': 'Kitchen',
  'lighting': 'Lighting',
  'flooring': 'Flooring',
  'curtains': 'Curtains',
  
  // Retail & Fashion
  'clothing': 'Clothing',
  'vintage': 'Vintage',
  'shoes': 'Shoes',
  'accessory': 'Accessories',
  'jewelry': 'Jewelry',
  'watches': 'Watches',
  'bag': 'Bags',
  
  // Food & Produce
  'bakery': 'Bakery',
  'coffee': 'Coffee',
  'cheesemonger': 'Cheesemonger',
  'deli': 'Deli',
  'farmers_market': 'Market',
  'health_food': 'Health Food',
  'ice_cream': 'Ice Cream',
  'organic': 'Organic',
  
  // Art & Design
  'gallery': 'Gallery',
  'craft': 'Craft',
  'design': 'Design',
  'art_shop': 'Art Shop',
  
  // Cafes & Drinks
  'cafe': 'Cafe',
  'bar': 'Bar',
  'wine_bar': 'Wine Bar',
  'pub': 'Pub',
  'brewery': 'Brewery',
  'distillery': 'Distillery',
  'coffee_shop': 'Coffee Shop'
};

// Define restaurant-specific tag handling
const GENERIC_RESTAURANT_TAGS = new Set([
  'restaurant', 'fast_food', 'takeaway', 'breakfast', 
  'british', 'american', 'cocktails'
]);

const CUISINE_TAGS = new Set([
  'sushi', 'pizza', 'burger', 'chinese', 'thai', 'indian', 'mexican', 'italian',
  'french', 'spanish', 'japanese', 'korean', 'vietnamese', 'thai', 'turkish',
  'greek', 'portuguese', 'brazilian', 'argentinian', 'lebanese', 'moroccan',
  'vegetarian', 'vegan', 'gluten_free', 'kosher', 'halal', 'seafood', 'steak',
  'barbeque', 'barbecue', 'bbq', 'chicken', 'fish_and_chips', 'fish', 'chips',
  'noodle', 'ramen', 'pasta', 'tapas', 'dessert', 'cake', 'coffee', 'bakery',
  'deli', 'sandwich', 'bagel', 'pho', 'kebab', 'shawarma', 'falafel'
]);

function estimateSubCategory(listing) {
  const categorySlug = listing.category_slug?.toLowerCase() || '';
  const imageCategory = listing.image_category?.toLowerCase() || '';
  const tagsJson = listing.tags;

  let tags = [];
  try {
    if (typeof tagsJson === 'string' && tagsJson.startsWith('[')) {
      tags = JSON.parse(tagsJson).map(t => t.toLowerCase());
    } else if (Array.isArray(tagsJson)) {
      tags = tagsJson.map(t => t.toLowerCase());
    }
  } catch (e) {
    // Invalid JSON, proceed with empty tags
  }

  // For restaurants: prioritize cuisine tags only
  if (categorySlug === 'restaurants') {
    // Skip generic restaurant tags, look for cuisine-specific tags
    for (const tag of tags) {
      if (GENERIC_RESTAURANT_TAGS.has(tag)) {
        continue; // Skip generic tags for restaurants
      }
      if (CUISINE_TAGS.has(tag)) {
        const subCat = TAG_TO_SUBCATEGORY[tag];
        if (subCat) {
          return subCat;
        }
      }
    }
    // No cuisine tag found - return null for manual curation
    return null;
  }

  // For other categories: match any tag first
  for (const tag of tags) {
    const subCat = TAG_TO_SUBCATEGORY[tag];
    if (subCat) {
      return subCat;
    }
  }

  // Fallback to image_category if no tags matched
  if (imageCategory) {
    // Capitalize first letter
    return imageCategory.charAt(0).toUpperCase() + imageCategory.slice(1);
  }

  // Final fallback: use category name if we have nothing else
  if (categorySlug) {
    return categorySlug
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  return null;
}

function main() {
  // Read CSV
  const csvPath = path.join(__dirname, '../db_backup./listings_rows-05.csv');
  if (!fs.existsSync(csvPath)) {
    console.error(`CSV file not found: ${csvPath}`);
    process.exit(1);
  }

  const fileContent = fs.readFileSync(csvPath, 'utf-8');
  const records = parseCsv(fileContent, {
    columns: true,
    skip_empty_lines: true
  });

  console.log(`Loaded ${records.length} listings from CSV`);

  // Add sub_category column
  const enrichedRecords = records.map(record => {
    const subCategory = estimateSubCategory(record);
    return {
      ...record,
      sub_category: subCategory || ''
    };
  });

  // Count statistics
  const stats = {
    total: enrichedRecords.length,
    withSubCategory: enrichedRecords.filter(r => r.sub_category).length,
    byCategory: {}
  };

  // Analyze by category
  for (const record of enrichedRecords) {
    const cat = record.category_slug || 'unknown';
    if (!stats.byCategory[cat]) {
      stats.byCategory[cat] = {
        total: 0,
        withSubCategory: 0,
        subCategories: {}
      };
    }
    stats.byCategory[cat].total++;
    if (record.sub_category) {
      stats.byCategory[cat].withSubCategory++;
      const subCat = record.sub_category;
      stats.byCategory[cat].subCategories[subCat] = 
        (stats.byCategory[cat].subCategories[subCat] || 0) + 1;
    }
  }

  console.log('\n=== SUB-CATEGORY ESTIMATION RESULTS ===\n');
  console.log(`Total Listings: ${stats.total}`);
  console.log(`With Sub-Category: ${stats.withSubCategory} (${((stats.withSubCategory/stats.total)*100).toFixed(1)}%)`);
  console.log(`Without Sub-Category: ${stats.total - stats.withSubCategory}`);

  console.log('\n=== BY CATEGORY ===\n');
  for (const [catSlug, catStats] of Object.entries(stats.byCategory)) {
    console.log(`${catSlug.toUpperCase()}`);
    console.log(`  Total: ${catStats.total}`);
    console.log(`  With Sub-Category: ${catStats.withSubCategory}`);
    
    if (Object.keys(catStats.subCategories).length > 0) {
      console.log(`  Sub-Categories:`);
      for (const [subCat, count] of Object.entries(catStats.subCategories).sort((a, b) => b[1] - a[1])) {
        console.log(`    - ${subCat}: ${count}`);
      }
    } else {
      console.log(`  Sub-Categories: (none)`);
    }
    console.log();
  }

  // Write enriched CSV
  const outputPath = path.join(__dirname, '../db_backup./listings_rows-05-with-subcategory-v2.csv');
  const csvOutput = stringify(enrichedRecords, { header: true });
  fs.writeFileSync(outputPath, csvOutput);

  console.log(`\n✅ Enriched CSV saved to: ${outputPath}`);
  console.log(`\n📊 Sample Output (first 3 restaurants):`);
  
  const restaurantSamples = enrichedRecords
    .filter(r => r.category_slug === 'restaurants')
    .slice(0, 3);

  for (const sample of restaurantSamples) {
    console.log(`\n  📍 ${sample.business_name || 'Unknown'}`);
    console.log(`     Tags: ${sample.tags}`);
    console.log(`     Sub-Category: ${sample.sub_category || '(null - needs manual curation)'}`);
  }
}

main();
