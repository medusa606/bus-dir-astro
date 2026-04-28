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

async function importSubCategories() {
  try {
    console.log('📖 Reading enriched CSV...');
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

    for (let i = 0; i < recordsWithSubCat.length; i += batchSize) {
      const batch = recordsWithSubCat.slice(i, i + batchSize);
      const updates = batch.map(record => {
        const subCategorySlug = slugify(record.sub_category);
        return {
          id: record.id,
          sub_category: record.sub_category,
          sub_category_slug: subCategorySlug
        };
      });

      // Try to update by business_slug first (more reliable), then by id
      for (const update of updates) {
        try {
          // Find the listing by id or business_slug
          const { data: existing, error: selectError } = await supabase
            .from('listings')
            .select('id')
            .eq('id', update.id)
            .single();

          if (selectError || !existing) {
            console.warn(`⚠️  Skipped (not found): ID ${update.id}`);
            continue;
          }

          // Update the listing
          const { error: updateError } = await supabase
            .from('listings')
            .update({
              sub_category: update.sub_category,
              sub_category_slug: update.sub_category_slug
            })
            .eq('id', update.id);

          if (updateError) {
            console.error(`❌ Error updating ID ${update.id}:`, updateError.message);
            errors++;
          } else {
            updated++;
            if (updated % 100 === 0) {
              console.log(`  ✓ Updated ${updated} listings...`);
            }
          }
        } catch (err) {
          console.error(`❌ Error processing ID ${update.id}:`, err.message);
          errors++;
        }
      }

      // Rate limiting
      if (i + batchSize < recordsWithSubCat.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    console.log(`\n✅ Import Complete:`);
    console.log(`   Updated: ${updated} listings`);
    console.log(`   Errors: ${errors}`);
    console.log(`   Skipped (no sub-category): ${records.length - recordsWithSubCat.length}`);

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

importSubCategories();
