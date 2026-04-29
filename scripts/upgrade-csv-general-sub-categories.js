#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

const slugify = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

// Read both CSV files
console.log('📖 Reading CSVs...');

const v2Content = fs.readFileSync('./db_backup./listings_rows-05-with-subcategory-v2.csv', 'utf-8');
const v2Records = parse(v2Content, { columns: true });

const currentContent = fs.readFileSync('./db_backup./listings_rows-06.csv', 'utf-8');
const currentRecords = parse(currentContent, { columns: true });

// Build mapping from v2: id -> {sub_category, sub_category_slug}
const v2Map = {};
v2Records.forEach(record => {
  if (record.id && record.sub_category && record.sub_category.trim()) {
    v2Map[record.id] = {
      sub_category: record.sub_category,
      sub_category_slug: slugify(record.sub_category)
    };
  }
});

console.log(`✅ Loaded ${v2Records.length} records from v2 CSV`);
console.log(`   ${Object.keys(v2Map).length} have valid sub-categories`);
console.log(`✅ Loaded ${currentRecords.length} records from current CSV`);

// Find and update records with "General" that have v2 upgrade
let upgradeCount = 0;
const updatedRecords = currentRecords.map(record => {
  if (record.sub_category === 'General' && record.id && v2Map[record.id]) {
    const upgrade = v2Map[record.id];
    upgradeCount++;
    return {
      ...record,
      sub_category: upgrade.sub_category,
      sub_category_slug: upgrade.sub_category_slug
    };
  }
  return record;
});

console.log(`\n📊 Found ${upgradeCount} records with "General" sub-category that can be upgraded`);

// Write back to CSV
const csvOutput = stringify(updatedRecords, {
  header: true,
  columns: Object.keys(currentRecords[0])
});

fs.writeFileSync('./db_backup./listings_rows-06.csv', csvOutput);

console.log(`\n✅ CSV Updated:`);
console.log(`   Updated: ${upgradeCount} records`);
console.log(`   Written to: db_backup./listings_rows-06.csv`);
