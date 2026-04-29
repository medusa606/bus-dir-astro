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

// Fields that should be numeric/real
const numericFields = ['latitude', 'longitude', 'google_rating', 'google_review_count', 'fsa_hygiene_score'];
// Fields that should be timestamps
const timestampFields = ['last_synced_at', 'illustration_generated_at', 'scrape_date'];

async function importCsvCleaned() {
  console.log('📖 Reading CSV...');
  const content = fs.readFileSync('./db_backup./listings_rows-06.csv', 'utf-8');
  const records = parse(content, { columns: true });

  console.log(`✅ Loaded ${records.length} records from CSV`);
  console.log('🧹 Cleaning data...');

  // Clean records: convert empty strings to null for numeric/timestamp fields
  const cleanedRecords = records.map(record => {
    const cleaned = { ...record };
    
    for (const field of numericFields) {
      if (cleaned[field] === '' || cleaned[field] === undefined) {
        cleaned[field] = null;
      }
    }
    
    for (const field of timestampFields) {
      if (cleaned[field] === '' || cleaned[field] === undefined) {
        cleaned[field] = null;
      }
    }
    
    return cleaned;
  });

  console.log(`✅ Cleaned ${cleanedRecords.length} records\n`);

  let upserted = 0;
  let errors = 0;
  const batchSize = 50;

  for (let i = 0; i < cleanedRecords.length; i += batchSize) {
    const batch = cleanedRecords.slice(i, i + batchSize);

    const { error } = await supabase
      .from('listings')
      .upsert(batch, { onConflict: 'id' });

    if (error) {
      console.error(`❌ Batch ${i / batchSize + 1} error:`, error.message);
      errors++;
    } else {
      upserted += batch.length;
    }

    const progress = Math.min(i + batchSize, cleanedRecords.length);
    console.log(`  ✓ Upserted ${progress} of ${cleanedRecords.length} records...`);

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

  const { data: verification, error: verifyError } = await supabase
    .from('listings')
    .select('sub_category, category_slug')
    .eq('category_slug', 'restaurants')
    .limit(1000);

  if (!verifyError && verification) {
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

importCsvCleaned();
