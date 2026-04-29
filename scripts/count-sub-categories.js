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

async function countSubCategories() {
  console.log('📊 Counting sub-categories...\n');
  
  try {
    // Count all sub_categories
    const { data: allCounts, error: error1 } = await supabase
      .from('listings')
      .select('sub_category')
      .not('sub_category', 'is', null);
    
    if (error1) throw error1;
    
    // Count by category
    const { data: restaurantCounts, error: error2 } = await supabase
      .from('listings')
      .select('sub_category')
      .eq('category_slug', 'restaurants')
      .not('sub_category', 'is', null);
    
    if (error2) throw error2;
    
    // Process all listings
    const allStats = {};
    allCounts.forEach(record => {
      const cat = record.sub_category;
      allStats[cat] = (allStats[cat] || 0) + 1;
    });
    
    // Process restaurant listings
    const restaurantStats = {};
    restaurantCounts.forEach(record => {
      const cat = record.sub_category;
      restaurantStats[cat] = (restaurantStats[cat] || 0) + 1;
    });
    
    console.log('========================================');
    console.log('ALL LISTINGS - SUB_CATEGORY COUNT');
    console.log('========================================\n');
    
    const allSorted = Object.entries(allStats).sort((a, b) => b[1] - a[1]);
    const allOutput = allSorted.map(([cat, count]) => `${cat}\t${count}`).join('\n');
    console.log(allOutput);
    
    console.log('\n\n========================================');
    console.log('RESTAURANTS ONLY - SUB_CATEGORY COUNT');
    console.log('========================================\n');
    
    const restSorted = Object.entries(restaurantStats).sort((a, b) => b[1] - a[1]);
    const restOutput = restSorted.map(([cat, count]) => `${cat}\t${count}`).join('\n');
    console.log(restOutput);
    
    console.log('\n\n========================================');
    console.log('COPY-FRIENDLY FORMAT (All Listings)');
    console.log('========================================\n');
    allSorted.forEach(([cat, count]) => {
      console.log(`${cat}: ${count}`);
    });
    
    console.log('\n\n========================================');
    console.log('COPY-FRIENDLY FORMAT (Restaurants)');
    console.log('========================================\n');
    restSorted.forEach(([cat, count]) => {
      console.log(`${cat}: ${count}`);
    });
    
    console.log('\n\n========================================');
    console.log('SQL QUERIES');
    console.log('========================================\n');
    console.log('-- All listings:');
    console.log('SELECT sub_category, COUNT(*) as count');
    console.log('FROM listings');
    console.log('WHERE sub_category IS NOT NULL');
    console.log('GROUP BY sub_category');
    console.log('ORDER BY count DESC;\n');
    
    console.log('-- Restaurants only:');
    console.log('SELECT sub_category, COUNT(*) as count');
    console.log('FROM listings');
    console.log('WHERE category_slug = \'restaurants\'');
    console.log('AND sub_category IS NOT NULL');
    console.log('GROUP BY sub_category');
    console.log('ORDER BY count DESC;');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

countSubCategories();
