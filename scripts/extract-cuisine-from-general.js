#!/usr/bin/env node

import fs from 'fs';
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

// Cuisine-specific tags to extract
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

// Generic tags to ignore
const IGNORE_TAGS = new Set(['restaurant', 'takeaway', 'fast_food', 'cafe', 'bar', 'pub']);

console.log('📖 Reading CSV...');
const content = fs.readFileSync('./db_backup./listings_rows-06.csv', 'utf-8');
const records = parse(content, { columns: true });

console.log(`✅ Loaded ${records.length} records\n`);

let updated = 0;
const updatedRecords = records.map(record => {
  // Only process records that have "general" sub_category and are restaurants
  if (record.sub_category && record.sub_category.toLowerCase() === 'general' && record.category_slug === 'restaurants') {
    // Parse tags
    try {
      const tagsStr = record.tags || '';
      const tagsArray = JSON.parse(tagsStr);
      
      if (Array.isArray(tagsArray)) {
        // Look for cuisine-specific tags, ignoring generic ones
        for (const tag of tagsArray) {
          const tagLower = tag.toLowerCase();
          
          // Skip generic tags
          if (IGNORE_TAGS.has(tagLower)) {
            continue;
          }
          
          // Check if it's a cuisine tag
          if (CUISINE_TAGS[tagLower]) {
            const newCategory = CUISINE_TAGS[tagLower];
            console.log(`✓ ${record.name}: "${tagLower}" → "${newCategory}"`);
            return {
              ...record,
              sub_category: newCategory,
              sub_category_slug: slugify(newCategory)
            };
          }
        }
      }
    } catch (e) {
      // If tags parsing fails, leave as is
    }
  }
  
  return record;
});

// Count changes
const changedCount = updatedRecords.filter((rec, idx) => {
  return rec.sub_category !== records[idx].sub_category;
}).length;

console.log(`\n✅ Found and upgraded ${changedCount} records from "general" to specific cuisines\n`);

// Write back to CSV
const csvOutput = stringify(updatedRecords, {
  header: true,
  columns: Object.keys(records[0])
});

fs.writeFileSync('./db_backup./listings_rows-06.csv', csvOutput);
console.log(`📝 Written to: db_backup./listings_rows-06.csv`);

// Show sample of upgrades
console.log('\n📊 Sample upgrades:');
updatedRecords.slice(0, 20).forEach((rec, idx) => {
  if (rec.sub_category !== records[idx].sub_category) {
    console.log(`   ${rec.name}`);
    console.log(`      Was: ${records[idx].sub_category} → Now: ${rec.sub_category}`);
  }
});
