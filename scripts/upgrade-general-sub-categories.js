import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse as parseCsv } from 'csv-parse/sync';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function slugify(text) {
  if (!text) return null;
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/&/g, 'and')
    .replace(/[^\w\-]/g, '');
}

async function mergeSubCategories() {
  try {
    console.log('📖 Reading CSVs...');
    
    // Read the enriched v2 CSV
    const v2CsvPath = path.join(__dirname, '../db_backup./listings_rows-05-with-subcategory-v2.csv');
    if (!fs.existsSync(v2CsvPath)) {
      console.error(`❌ V2 CSV not found: ${v2CsvPath}`);
      process.exit(1);
    }
    
    const v2Content = fs.readFileSync(v2CsvPath, 'utf-8');
    const v2Records = parseCsv(v2Content, {
      columns: true,
      skip_empty_lines: true
    });

    // Build a map: id -> sub_category from v2
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
    console.log(`   ${Object.keys(v2Map).length} have valid sub-categories\n`);

    // Read current CSV
    const currentCsvPath = path.join(__dirname, '../db_backup./listings_rows-06.csv');
    if (!fs.existsSync(currentCsvPath)) {
      console.error(`❌ Current CSV not found: ${currentCsvPath}`);
      process.exit(1);
    }

    const currentContent = fs.readFileSync(currentCsvPath, 'utf-8');
    const currentRecords = parseCsv(currentContent, {
      columns: true,
      skip_empty_lines: true
    });

    console.log(`✅ Loaded ${currentRecords.length} records from current CSV\n`);

    // Find records with "General" that can be upgraded
    const generalRecords = currentRecords.filter(r => r.sub_category === 'General' && r.id && v2Map[r.id]);
    
    console.log(`📊 Found ${generalRecords.length} records with "General" sub-category that can be upgraded\n`);

    if (generalRecords.length === 0) {
      console.log('✅ No "General" records to upgrade!');
      process.exit(0);
    }

    // Update database in batches
    const batchSize = 50;
    let updated = 0;
    let errors = 0;

    for (let i = 0; i < generalRecords.length; i += batchSize) {
      const batch = generalRecords.slice(i, i + batchSize);

      for (const record of batch) {
        try {
          const newData = v2Map[record.id];
          
          // Update the listing
          const { error: updateError } = await supabase
            .from('listings')
            .update({
              sub_category: newData.sub_category,
              sub_category_slug: newData.sub_category_slug
            })
            .eq('id', record.id);

          if (updateError) {
            console.error(`❌ Error updating ID ${record.id}:`, updateError.message);
            errors++;
          } else {
            updated++;
            if (updated % 50 === 0) {
              console.log(`  ✓ Upgraded ${updated} "General" records...`);
            }
          }
        } catch (err) {
          console.error(`❌ Error processing ID ${record.id}:`, err.message);
          errors++;
        }
      }

      // Rate limiting
      if (i + batchSize < generalRecords.length) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }

    console.log(`\n✅ Upgrade Complete:`);
    console.log(`   Updated: ${updated} records`);
    console.log(`   Errors: ${errors}`);

    if (updated > 0) {
      console.log(`\n📊 Running verification query...`);
      const { data: sampleData } = await supabase
        .from('listings')
        .select('id, business_name, sub_category, sub_category_slug, category_slug')
        .eq('category_slug', 'restaurants')
        .not('sub_category', 'is', null)
        .limit(5);

      if (sampleData && sampleData.length > 0) {
        console.log(`\n📍 Sample upgraded restaurants:`);
        sampleData.forEach((row, i) => {
          console.log(`  ${i+1}. ${row.business_name || 'Unknown'}: ${row.sub_category} (${row.sub_category_slug})`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

mergeSubCategories();
