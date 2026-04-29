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

async function uploadSubCategories() {
  try {
    console.log('📖 Reading enriched CSV with sub-categories...');
    const csvPath = path.join(__dirname, '../db_backup./listings_rows-05-with-subcategory-v2.csv');
    
    if (!fs.existsSync(csvPath)) {
      console.error(`❌ CSV not found: ${csvPath}`);
      process.exit(1);
    }

    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const records = parseCsv(fileContent, {
      columns: true,
      skip_empty_lines: true
    });

    console.log(`✅ Loaded ${records.length} records from CSV\n`);

    // Filter for records with sub_category
    const recordsWithSubCat = records.filter(r => r.sub_category && r.sub_category.trim());
    console.log(`📊 Records with sub-categories: ${recordsWithSubCat.length}`);
    console.log(`⚠️  Records without sub-categories: ${records.length - recordsWithSubCat.length}\n`);

    // Process in batches
    const batchSize = 50;
    let updated = 0;
    let errors = 0;
    let notFound = 0;

    for (let i = 0; i < recordsWithSubCat.length; i += batchSize) {
      const batch = recordsWithSubCat.slice(i, i + batchSize);

      for (const record of batch) {
        try {
          const subCategorySlug = slugify(record.sub_category);
          
          // Update the listing by ID
          const { error: updateError } = await supabase
            .from('listings')
            .update({
              sub_category: record.sub_category,
              sub_category_slug: subCategorySlug
            })
            .eq('id', record.id);

          if (updateError) {
            if (updateError.message.includes('no rows')) {
              notFound++;
            } else {
              console.error(`❌ Error updating ID ${record.id}:`, updateError.message);
              errors++;
            }
          } else {
            updated++;
            if (updated % 100 === 0) {
              console.log(`  ✓ Updated ${updated} listings...`);
            }
          }
        } catch (err) {
          console.error(`❌ Error processing ID ${record.id}:`, err.message);
          errors++;
        }
      }

      // Rate limiting
      if (i + batchSize < recordsWithSubCat.length) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }

    console.log(`\n✅ Upload Complete:`);
    console.log(`   Updated: ${updated} listings`);
    console.log(`   Not found in DB: ${notFound} listings (may be from different city/backup)`);
    console.log(`   Errors: ${errors}`);
    console.log(`   Skipped (no sub-category): ${records.length - recordsWithSubCat.length}`);

    if (updated > 0) {
      console.log(`\n📊 Running verification query...`);
      const { data: sampleData } = await supabase
        .from('listings')
        .select('id, business_name, sub_category, sub_category_slug, category_slug')
        .eq('category_slug', 'restaurants')
        .not('sub_category', 'is', null)
        .limit(5);

      if (sampleData && sampleData.length > 0) {
        console.log(`\n📍 Sample updated restaurants:`);
        sampleData.forEach((row, i) => {
          console.log(`  ${i+1}. ${row.business_name || 'Unknown'}: ${row.sub_category}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

uploadSubCategories();
