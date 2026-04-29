#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function importCsvUpsert() {
  console.log('📖 Reading CSV...');
  const content = fs.readFileSync('./db_backup./listings_rows-06.csv', 'utf-8');
  const records = parse(content, { columns: true });

  console.log(`✅ Loaded ${records.length} records from CSV\n`);

  let upserted = 0;
  let errors = 0;
  const batchSize = 50;

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);

    const { error } = await supabase
      .from('listings')
      .upsert(batch, { onConflict: 'id' });

    if (error) {
      console.error(`❌ Batch error:`, error.message);
      errors++;
    } else {
      upserted += batch.length;
    }

    const progress = Math.min(i + batchSize, records.length);
    console.log(`  ✓ Upserted ${progress} of ${records.length} records...`);

    // Rate limit: 300ms between batches
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  console.log(`\n✅ Import Complete:`);
  console.log(`   Upserted: ${upserted} records`);
  console.log(`   Errors: ${errors} batch(es)`);

  // Verify the results
  console.log(`\n📊 Verifying restaurants sub-categories...\n`);
  const { data: verification, error: verifyError, count } = await supabase
    .from('listings')
    .select('sub_category', { count: 'exact' })
    .eq('category_slug', 'restaurants')
    .not('sub_category', 'is', null);

  if (!verifyError && verification) {
    const subcategoryStats = {};
    verification.forEach(record => {
      const cat = record.sub_category;
      subcategoryStats[cat] = (subcategoryStats[cat] || 0) + 1;
    });

    console.log('Restaurant sub-categories (top 20):');
    Object.entries(subcategoryStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .forEach(([cat, count]) => {
        console.log(`   ${cat}: ${count}`);
      });

    const generalCount = subcategoryStats['General'] || subcategoryStats['general'] || 0;
    console.log(`\n📈 Summary:`);
    console.log(`   Total restaurants: ${count}`);
    console.log(`   Remaining "General": ${generalCount}`);
    console.log(`   Classified: ${count - generalCount}`);
  }
}

importCsvUpsert();
