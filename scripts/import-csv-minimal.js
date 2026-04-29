#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL;
// Try service_role key first (admin access), fallback to anon key
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function importCsvMinimal() {
  console.log('📖 Reading CSV...');
  const content = fs.readFileSync('./db_backup./listings_rows-06.csv', 'utf-8');
  const records = parse(content, { columns: true });

  console.log(`✅ Loaded ${records.length} records from CSV\n`);

  // Extract only the key columns we need
  const minimalRecords = records.map(record => ({
    id: record.id,
    name: record.name,
    tags: record.tags ? JSON.parse(record.tags) : [],
    category_slug: record.category_slug,
    sub_category: record.sub_category || null,
    sub_category_slug: record.sub_category_slug || null,
  }));

  let upserted = 0;
  let errors = 0;
  const batchSize = 50;

  for (let i = 0; i < minimalRecords.length; i += batchSize) {
    const batch = minimalRecords.slice(i, i + batchSize);

    const { error } = await supabase
      .from('listings')
      .upsert(batch, { onConflict: 'id' });

    if (error) {
      console.error(`❌ Batch ${i / batchSize + 1} error:`, error.message);
      errors++;
    } else {
      upserted += batch.length;
    }

    const progress = Math.min(i + batchSize, minimalRecords.length);
    console.log(`  ✓ Upserted ${progress} of ${minimalRecords.length} records...`);

    // Rate limit: 300ms between batches
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  console.log(`\n✅ Import Complete:`);
  console.log(`   Upserted: ${upserted} records`);
  console.log(`   Errors: ${errors} batch(es)`);

  // Verify the results
  console.log(`\n📊 Verifying data...\n`);
  const { count: totalCount } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true });

  console.log(`Total listings in DB: ${totalCount}`);

  const { data: verification } = await supabase
    .from('listings')
    .select('sub_category')
    .eq('category_slug', 'restaurants')
    .limit(1000);

  if (verification) {
    const subcategoryStats = {};
    verification.forEach(record => {
      const cat = record.sub_category || 'null';
      subcategoryStats[cat] = (subcategoryStats[cat] || 0) + 1;
    });

    console.log(`\nRestaurant sub-categories (${verification.length} restaurants):`);
    Object.entries(subcategoryStats)
      .sort((a, b) => b[1] - a[1])
      .forEach(([cat, count]) => {
        console.log(`   ${cat}: ${count}`);
      });
  }
}

importCsvMinimal();
