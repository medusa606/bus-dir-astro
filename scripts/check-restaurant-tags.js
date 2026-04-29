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

async function checkRestaurantTags() {
  console.log('🔍 Checking restaurant tags...\n');
  
  try {
    // Get 20 restaurants with different tags
    const { data: restaurants, error: fetchError } = await supabase
      .from('listings')
      .select('id, name, tags, sub_category')
      .eq('category_slug', 'restaurants')
      .limit(20);

    if (fetchError) throw fetchError;

    console.log(`Found ${restaurants.length} restaurants\n`);
    
    restaurants.forEach((r, idx) => {
      console.log(`${idx + 1}. ${r.name}`);
      console.log(`   ID: ${r.id}`);
      console.log(`   Tags: ${JSON.stringify(r.tags)}`);
      console.log(`   Sub-category: ${r.sub_category}`);
      console.log();
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkRestaurantTags();
