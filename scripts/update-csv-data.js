#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateFromCsv() {
  console.log('📖 Reading CSV...');
  const content = fs.readFileSync('./db_backup./listings_rows-06.csv', 'utf-8');
  const records = parse(content, { columns: true });

  console.log(`✅ Loaded ${records.length} records from CSV\n`);

  let updated = 0;
  let errors = 0;
  let skipped = 0;
  const batchSize = 50;

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);

    for (const record of batch) {
      if (!record.id) {
        skipped++;
        continue;
      }

      const { error } = await supabase
        .from('listings')
        .update({
          sub_category: record.sub_category || null,
          sub_category_slug: record.sub_category_slug || null,
        })
        .eq('id', record.id);

      if (error) {
        // Silently skip - likely record doesn't exist due to RLS
        skipped++;
      } else {
        updated++;
      }
    }

    const progress = Math.min(i + batchSize, records.length);
    console.log(`  ✓ Processed ${progress} of ${records.length} records (Updated: ${updated}, Skipped: ${skipped})...`);

    // Rate limit: 300ms between batches
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  console.log(`\n✅ Update Complete:`);
  console.log(`   Updated: ${updated} records`);
  console.log(`   Skipped/Error: ${skipped} records`);
  console.log(`   Total: ${updated + skipped}`);

  // Verify the results
  console.log(`\n📊 Verifying data...\n`);
  const { count: totalCount } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true });

  console.log(`Total listings in DB: ${totalCount}`);

  if (totalCount && totalCount > 0) {
    const { data: restaurants, count: restaurantCount } = await supabase
      .from('listings')
      .select('sub_category', { count: 'exact' })
      .eq('category_slug', 'restaurants');

    if (restaurants) {
      const subcategoryStats = {};
      restaurants.forEach(record => {
        const cat = record.sub_category || 'null';
        subcategoryStats[cat] = (subcategoryStats[cat] || 0) + 1;
      });

      console.log(`\nRestaurant sub-categories (${restaurantCount} restaurants):`);
      Object.entries(subcategoryStats)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 25)
        .forEach(([cat, count]) => {
          console.log(`   ${cat}: ${count}`);
        });
    }
  }
}

updateFromCsv();
