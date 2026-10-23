#!/usr/bin/env node
import fs from 'fs';
import { parse } from 'csv-parse/sync';

const data = fs.readFileSync('./curated/listings_rows-04b.csv', 'utf-8');
const records = parse(data, { columns: true });

let validCount = 0;
let invalidCount = 0;
const problems = [];

records.forEach(row => {
  const tags = row.tags;
  if (!tags || tags.trim().length === 0) {
    return; // skip empty
  }
  
  try {
    JSON.parse(tags);
    validCount++;
  } catch (e) {
    invalidCount++;
    if (problems.length < 15) {
      problems.push({ 
        id: row.id, 
        name: row.name, 
        category: row.category,
        tags: tags.substring(0, 150) 
      });
    }
  }
});

console.log('Valid JSON tags:', validCount);
console.log('Invalid/malformed tags:', invalidCount);
console.log('\nFirst 15 problems:');
problems.forEach(p => {
  console.log(`\nID: ${p.id}`);
  console.log(`Name: ${p.name}`);
  console.log(`Category: ${p.category}`);
  console.log(`Tags: ${p.tags}...`);
});
