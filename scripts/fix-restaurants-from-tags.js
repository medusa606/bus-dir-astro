#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Cuisine tags to match (same as extract script)
const CUISINE_TAGS = {
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
  'lebanese': 'Lebanese',
  'moroccan': 'Moroccan',
  'fish_and_chips': 'Fish & Chips',
  'noodle': 'Noodles',
  'noodles': 'Noodles',
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
  'kebab': 'Kebab',
  'sandwich': 'Sandwich',
  'asian': 'Asian',
  'caribbean': 'Caribbean',
  'falafel': 'Falafel',
  'jamaican': 'Jamaican',
  'tex-mex': 'Tex-Mex',
  'middle_eastern': 'Middle Eastern',
  'american': 'American',
  'wings': 'Wings',
  'pie': 'Pie',
  'crepe': 'Crepe',
  'persian': 'Persian',
  'bagel': 'Bagel',
  'pakistani': 'Pakistani',
  'hawaiian': 'Hawaiian',
  'swedish': 'Swedish',
  'english': 'English',
  'pita': 'Pita',
};

// Tags to ignore (generic)
const IGNORE_TAGS = new Set(['restaurant', 'takeaway', 'fast_food', 'cafe', 'bar', 'pub']);

function slugify(text) {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[&]/g, 'and');
}

function extractCuisineFromTags(tagsJson) {
  if (!tagsJson) return null;

  let tags = [];
  try {
    if (typeof tagsJson === 'string') {
      tags = JSON.parse(tagsJson);
    } else {
      tags = tagsJson;
    }
  } catch (e) {
    return null;
  }

  if (!Array.isArray(tags)) return null;

  // Find first matching cuisine tag (excluding generic ones)
  for (const tag of tags) {
    const tagLower = tag.toLowerCase();
    if (!IGNORE_TAGS.has(tagLower) && CUISINE_TAGS[tagLower]) {
      return CUISINE_TAGS[tagLower];
    }
  }

  return null;
}

async function fixRestaurantSubCategories() {
  console.log('🔧 Fetching restaurants from database...\n');

  try {
    // Fetch all restaurants with their tags and current sub_category
    const { data: restaurants, error: fetchError } = await supabase
      .from('listings')
      .select('id, name, tags, sub_category')
      .eq('category_slug', 'restaurants');

    if (fetchError) {
      console.error('❌ Fetch error:', fetchError);
      process.exit(1);
    }

    console.log(`✅ Loaded ${restaurants.length} restaurants\n`);

    let updated = 0;
    let errors = 0;
    const updates = [];

    // Analyze each restaurant and determine correct sub_category
    for (const restaurant of restaurants) {
      const cuisine = extractCuisineFromTags(restaurant.tags);

      // Only update if we found a cuisine and it's different from current value
      if (cuisine && restaurant.sub_category !== cuisine) {
        updates.push({
          id: restaurant.id,
          name: restaurant.name,
          oldCategory: restaurant.sub_category,
          newCategory: cuisine,
        });
      }
    }

    console.log(`📊 Found ${updates.length} restaurants to update\n`);

    if (updates.length === 0) {
      console.log('✅ All restaurants already have correct sub-categories');
      process.exit(0);
    }

    // Show samples
    console.log('Sample updates:');
    updates.slice(0, 15).forEach(u => {
      console.log(`   ✓ ${u.name}: "${u.oldCategory}" → "${u.newCategory}"`);
    });
    if (updates.length > 15) {
      console.log(`   ... and ${updates.length - 15} more\n`);
    } else {
      console.log('');
    }

    // Perform updates in batches
    const batchSize = 50;
    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);

      for (const update of batch) {
        const { error } = await supabase
          .from('listings')
          .update({
            sub_category: update.newCategory,
            sub_category_slug: slugify(update.newCategory),
          })
          .eq('id', update.id);

        if (error) {
          console.error(`❌ Error updating ${update.id}:`, error.message);
          errors++;
        } else {
          updated++;
        }
      }

      const progress = Math.min(i + batchSize, updates.length);
      console.log(`  ✓ Updated ${progress} of ${updates.length} records...`);

      // Rate limit
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    console.log(`\n✅ Update Complete:`);
    console.log(`   Updated: ${updated} records`);
    console.log(`   Errors: ${errors} records`);

    // Verify results
    console.log(`\n📊 Final verification...\n`);
    const { data: stats, error: statsError } = await supabase
      .from('listings')
      .select('sub_category')
      .eq('category_slug', 'restaurants')
      .not('sub_category', 'is', null);

    if (statsError) {
      console.error('❌ Verification error:', statsError);
      process.exit(1);
    }

    const subcategoryStats = {};
    stats.forEach(record => {
      const cat = record.sub_category;
      subcategoryStats[cat] = (subcategoryStats[cat] || 0) + 1;
    });

    console.log('Restaurant sub-categories (sorted by count):');
    Object.entries(subcategoryStats)
      .sort((a, b) => b[1] - a[1])
      .forEach(([cat, count]) => {
        console.log(`   ${cat}: ${count}`);
      });

    const totalRestaurants = stats.length;
    const generalCount = subcategoryStats['General'] || subcategoryStats['general'] || 0;
    console.log(`\n📈 Summary:`);
    console.log(`   Total restaurants: ${totalRestaurants}`);
    console.log(`   Remaining "General": ${generalCount}`);
    console.log(`   Classified: ${totalRestaurants - generalCount}`);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

fixRestaurantSubCategories();
