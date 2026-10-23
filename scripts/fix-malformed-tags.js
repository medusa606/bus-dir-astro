#!/usr/bin/env node
/**
 * Fix malformed tags in Supabase database
 * Converts malformed tags like "\"spa\"}" to clean lowercase slugs
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function cleanTags(tags) {
  if (!Array.isArray(tags)) return tags;
  
  // Check if tags need fixing (if they contain quotes, braces, or backslashes that indicate corruption)
  const needsFix = tags.some(t => 
    typeof t === 'string' && (
      t.includes('"') || 
      t.includes('{') || 
      t.includes('}') ||
      t.includes('\\')
    )
  );
  
  if (!needsFix) return tags;
  
  // Clean up each tag
  return tags.map(t => {
    if (typeof t !== 'string') return t;
    // Remove quotes, braces, backslashes, and whitespace
    return t
      .replace(/["{\\}]/g, '')           // Remove all quotes, braces, backslashes
      .toLowerCase()
      .trim();
  }).filter(t => t.length > 0); // Remove empty strings
}

async function fixMalformedTags() {
  console.log('Fetching listings with potentially malformed tags...\n');
  
  // Paginate to fetch all listings past Supabase's 1000-row default limit
  const PAGE_SIZE = 1000;
  let allListings = [];
  let from = 0;
  while (true) {
    const { data: pageData, error } = await supabase
      .from('listings')
      .select('id, name, tags')
      .not('tags', 'is', null)
      .range(from, from + PAGE_SIZE - 1);
    
    if (error) {
      console.error('Error fetching listings:', error);
      process.exit(1);
    }
    
    if (!pageData || pageData.length === 0) break;
    allListings = allListings.concat(pageData);
    if (pageData.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }
  
  console.log(`Found ${allListings.length} total listings with tags\n`);
  
  let fixedCount = 0;
  let checkedCount = 0;
  const fixes = [];
  
  for (const listing of allListings) {
    const oldTags = listing.tags;
    
    // Check if this listing needs fixing
    const needsFix = Array.isArray(oldTags) && oldTags.some(t => 
      typeof t === 'string' && (
        t.includes('"') || 
        t.includes('{') || 
        t.includes('}') ||
        t.includes('\\')
      )
    );
    
    if (!needsFix) continue;
    
    checkedCount++;
    const cleanedTags = await cleanTags(oldTags);
    
    // Check if anything changed
    if (JSON.stringify(oldTags) !== JSON.stringify(cleanedTags)) {
      fixedCount++;
      
      if (fixes.length < 20) {
        fixes.push({
          id: listing.id,
          name: listing.name,
          old: JSON.stringify(oldTags),
          new: JSON.stringify(cleanedTags)
        });
      }
      
      // Update in database
      const { error: updateError } = await supabase
        .from('listings')
        .update({ tags: cleanedTags })
        .eq('id', listing.id);
      
      if (updateError) {
        console.error(`Error updating listing ${listing.id}:`, updateError);
      } else {
        console.log(`✅ Fixed: ${listing.name}`);
      }
    }
  }
  
  console.log(`\nChecked ${checkedCount} listings that need fixing`);
  console.log(`✅ Fixed ${fixedCount} listings with malformed tags\n`);
  console.log('Examples of fixes:');
  fixes.forEach(f => {
    console.log(`\nID: ${f.id}`);
    console.log(`Name: ${f.name}`);
    console.log(`Old:  ${f.old.substring(0, 100)}...`);
    console.log(`New:  ${f.new}`);
  });
}

fixMalformedTags().catch(console.error);
