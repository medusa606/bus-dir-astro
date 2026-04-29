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

async function normalizeSubCategories() {
  console.log('🔄 Normalizing sub-categories in database...\n');
  
  try {
    // Query 1: Replace 'Restaurant' (any case) with 'general'
    console.log('1️⃣ Replacing "restaurant" with "general"...');
    const { data: restaurantCount, error: error1 } = await supabase
      .rpc('exec_sql', {
        sql: `UPDATE listings 
              SET sub_category = 'general',
                  sub_category_slug = 'general'
              WHERE LOWER(sub_category) = 'restaurant' 
              RETURNING id;`
      });
    
    // Alternative approach using direct update
    const { error: dirError1 } = await supabase
      .from('listings')
      .update({ sub_category: 'general', sub_category_slug: 'general' })
      .eq('sub_category', 'restaurant');
    
    if (dirError1) {
      console.log(`   Note: Case-sensitive match - checking for exact 'restaurant'`);
    }
    
    // Query 2: Convert all sub_category and sub_category_slug to lowercase
    console.log('2️⃣ Converting all values to lowercase...');
    
    // Fetch all records
    const { data: allListings, error: fetchError } = await supabase
      .from('listings')
      .select('id, sub_category, sub_category_slug')
      .not('sub_category', 'is', null);
    
    if (fetchError) throw fetchError;
    
    let normalizedCount = 0;
    
    // Process in batches
    const batchSize = 50;
    for (let i = 0; i < allListings.length; i += batchSize) {
      const batch = allListings.slice(i, i + batchSize);
      
      for (const record of batch) {
        const newSubCategory = record.sub_category.toLowerCase();
        const newSlug = record.sub_category_slug ? record.sub_category_slug.toLowerCase() : '';
        
        // Only update if something changed
        if (newSubCategory !== record.sub_category || newSlug !== record.sub_category_slug) {
          const { error: updateError } = await supabase
            .from('listings')
            .update({
              sub_category: newSubCategory,
              sub_category_slug: newSlug
            })
            .eq('id', record.id);
          
          if (updateError) {
            console.error(`   Error updating ${record.id}:`, updateError.message);
          } else {
            normalizedCount++;
          }
        }
      }
      
      console.log(`   ✓ Processed ${Math.min(i + batchSize, allListings.length)} of ${allListings.length} records...`);
      // Rate limit: 300ms between batches
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    console.log(`\n✅ Normalization Complete:`);
    console.log(`   Lowercase conversions: ${normalizedCount} records`);
    
    // Verify results
    console.log(`\n📊 Running verification query...`);
    const { data: verification, error: verifyError } = await supabase
      .from('listings')
      .select('sub_category')
      .eq('category_slug', 'restaurants')
      .limit(1000);
    
    if (!verifyError && verification) {
      const subcategoryStats = {};
      verification.forEach(record => {
        const cat = record.sub_category;
        subcategoryStats[cat] = (subcategoryStats[cat] || 0) + 1;
      });
      
      console.log('\nSub-category distribution (restaurants):');
      Object.entries(subcategoryStats)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15)
        .forEach(([cat, count]) => {
          console.log(`   ${cat}: ${count}`);
        });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

normalizeSubCategories();
