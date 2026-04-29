#!/usr/bin/env node

import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

// Read CSV file
console.log('📖 Reading CSV...');
const content = fs.readFileSync('./db_backup./listings_rows-06.csv', 'utf-8');
const records = parse(content, { columns: true });

console.log(`✅ Loaded ${records.length} records`);

// Process records: convert to lowercase and replace 'restaurant' with 'general'
let restaurantCount = 0;
let capitalizedCount = 0;

const updatedRecords = records.map(record => {
  const updated = { ...record };
  
  // Process sub_category
  if (updated.sub_category) {
    const original = updated.sub_category;
    // Convert to lowercase
    updated.sub_category = updated.sub_category.toLowerCase();
    // Replace 'restaurant' with 'general'
    if (updated.sub_category === 'restaurant') {
      updated.sub_category = 'general';
      restaurantCount++;
    }
    if (original !== updated.sub_category) {
      capitalizedCount++;
    }
  }
  
  // Process sub_category_slug
  if (updated.sub_category_slug) {
    const original = updated.sub_category_slug;
    // Convert to lowercase
    updated.sub_category_slug = updated.sub_category_slug.toLowerCase();
    // Replace 'restaurant' with 'general'
    if (updated.sub_category_slug === 'restaurant') {
      updated.sub_category_slug = 'general';
    }
  }
  
  return updated;
});

// Write back to CSV
const csvOutput = stringify(updatedRecords, {
  header: true,
  columns: Object.keys(records[0])
});

fs.writeFileSync('./db_backup./listings_rows-06.csv', csvOutput);

console.log(`\n✅ CSV Updated:`);
console.log(`   Changed 'restaurant' → 'general': ${restaurantCount} records`);
console.log(`   Converted to lowercase: ${capitalizedCount} records`);
console.log(`   Written to: db_backup./listings_rows-06.csv`);
