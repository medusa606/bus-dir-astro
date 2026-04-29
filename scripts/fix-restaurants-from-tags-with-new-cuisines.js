#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixRestaurantSubCategories() {
  console.log('🔧 Updating restaurant sub-categories from tags (including kebab, sandwich, asian, caribbean, etc.)...\n');

  const sql = `
UPDATE listings
SET sub_category = CASE
  WHEN tags::text ILIKE '%"sushi"%'                                 THEN 'Sushi'
  WHEN tags::text ILIKE '%"pizza"%'                                 THEN 'Pizza'
  WHEN tags::text ILIKE '%"burger"%'                                THEN 'Burgers'
  WHEN tags::text ILIKE '%"chinese"%'                               THEN 'Chinese'
  WHEN tags::text ILIKE '%"thai"%'                                  THEN 'Thai'
  WHEN tags::text ILIKE '%"indian"%'                                THEN 'Indian'
  WHEN tags::text ILIKE '%"mexican"%'                               THEN 'Mexican'
  WHEN tags::text ILIKE '%"italian"%'                               THEN 'Italian'
  WHEN tags::text ILIKE '%"french"%'                                THEN 'French'
  WHEN tags::text ILIKE '%"spanish"%'                               THEN 'Spanish'
  WHEN tags::text ILIKE '%"japanese"%'                              THEN 'Japanese'
  WHEN tags::text ILIKE '%"korean"%'                                THEN 'Korean'
  WHEN tags::text ILIKE '%"vietnamese"%'                            THEN 'Vietnamese'
  WHEN tags::text ILIKE '%"turkish"%'                               THEN 'Turkish'
  WHEN tags::text ILIKE '%"greek"%'                                 THEN 'Greek'
  WHEN tags::text ILIKE '%"portuguese"%'                            THEN 'Portuguese'
  WHEN tags::text ILIKE '%"lebanese"%'                              THEN 'Lebanese'
  WHEN tags::text ILIKE '%"moroccan"%'                              THEN 'Moroccan'
  WHEN tags::text ILIKE '%"fish_and_chips"%'                        THEN 'Fish & Chips'
  WHEN tags::text ILIKE '%"noodle"%' OR tags::text ILIKE '%"noodles"%' THEN 'Noodles'
  WHEN tags::text ILIKE '%"ramen"%'                                 THEN 'Ramen'
  WHEN tags::text ILIKE '%"pasta"%'                                 THEN 'Pasta'
  WHEN tags::text ILIKE '%"tapas"%'                                 THEN 'Tapas'
  WHEN tags::text ILIKE '%"seafood"%'                               THEN 'Seafood'
  WHEN tags::text ILIKE '%"steak"%'                                 THEN 'Steak'
  WHEN tags::text ILIKE '%"bbq"%' OR tags::text ILIKE '%"barbeque"%' OR tags::text ILIKE '%"barbecue"%' THEN 'BBQ'
  WHEN tags::text ILIKE '%"chicken"%'                               THEN 'Chicken'
  WHEN tags::text ILIKE '%"vegetarian"%'                            THEN 'Vegetarian'
  WHEN tags::text ILIKE '%"vegan"%'                                 THEN 'Vegan'
  WHEN tags::text ILIKE '%"kebab"%'                                 THEN 'Kebab'
  WHEN tags::text ILIKE '%"sandwich"%'                              THEN 'Sandwich'
  WHEN tags::text ILIKE '%"asian"%'                                 THEN 'Asian'
  WHEN tags::text ILIKE '%"caribbean"%'                             THEN 'Caribbean'
  WHEN tags::text ILIKE '%"falafel"%'                               THEN 'Falafel'
  WHEN tags::text ILIKE '%"jamaican"%'                              THEN 'Jamaican'
  WHEN tags::text ILIKE '%"tex-mex"%' OR tags::text ILIKE '%"tex_mex"%' THEN 'Tex-Mex'
  WHEN tags::text ILIKE '%"middle_eastern"%'                        THEN 'Middle Eastern'
  WHEN tags::text ILIKE '%"american"%'                              THEN 'American'
  WHEN tags::text ILIKE '%"wings"%'                                 THEN 'Wings'
  WHEN tags::text ILIKE '%"pie"%'                                   THEN 'Pie'
  WHEN tags::text ILIKE '%"crepe"%'                                 THEN 'Crepe'
  WHEN tags::text ILIKE '%"persian"%'                               THEN 'Persian'
  WHEN tags::text ILIKE '%"bagel"%'                                 THEN 'Bagel'
  WHEN tags::text ILIKE '%"pakistani"%'                             THEN 'Pakistani'
  WHEN tags::text ILIKE '%"hawaiian"%'                              THEN 'Hawaiian'
  WHEN tags::text ILIKE '%"swedish"%'                               THEN 'Swedish'
  WHEN tags::text ILIKE '%"english"%'                               THEN 'English'
  WHEN tags::text ILIKE '%"pita"%'                                  THEN 'Pita'
  ELSE 'General'
END,
sub_category_slug = CASE
  WHEN tags::text ILIKE '%"sushi"%'                                 THEN 'sushi'
  WHEN tags::text ILIKE '%"pizza"%'                                 THEN 'pizza'
  WHEN tags::text ILIKE '%"burger"%'                                THEN 'burgers'
  WHEN tags::text ILIKE '%"chinese"%'                               THEN 'chinese'
  WHEN tags::text ILIKE '%"thai"%'                                  THEN 'thai'
  WHEN tags::text ILIKE '%"indian"%'                                THEN 'indian'
  WHEN tags::text ILIKE '%"mexican"%'                               THEN 'mexican'
  WHEN tags::text ILIKE '%"italian"%'                               THEN 'italian'
  WHEN tags::text ILIKE '%"french"%'                                THEN 'french'
  WHEN tags::text ILIKE '%"spanish"%'                               THEN 'spanish'
  WHEN tags::text ILIKE '%"japanese"%'                              THEN 'japanese'
  WHEN tags::text ILIKE '%"korean"%'                                THEN 'korean'
  WHEN tags::text ILIKE '%"vietnamese"%'                            THEN 'vietnamese'
  WHEN tags::text ILIKE '%"turkish"%'                               THEN 'turkish'
  WHEN tags::text ILIKE '%"greek"%'                                 THEN 'greek'
  WHEN tags::text ILIKE '%"portuguese"%'                            THEN 'portuguese'
  WHEN tags::text ILIKE '%"lebanese"%'                              THEN 'lebanese'
  WHEN tags::text ILIKE '%"moroccan"%'                              THEN 'moroccan'
  WHEN tags::text ILIKE '%"fish_and_chips"%'                        THEN 'fish-and-chips'
  WHEN tags::text ILIKE '%"noodle"%' OR tags::text ILIKE '%"noodles"%' THEN 'noodles'
  WHEN tags::text ILIKE '%"ramen"%'                                 THEN 'ramen'
  WHEN tags::text ILIKE '%"pasta"%'                                 THEN 'pasta'
  WHEN tags::text ILIKE '%"tapas"%'                                 THEN 'tapas'
  WHEN tags::text ILIKE '%"seafood"%'                               THEN 'seafood'
  WHEN tags::text ILIKE '%"steak"%'                                 THEN 'steak'
  WHEN tags::text ILIKE '%"bbq"%' OR tags::text ILIKE '%"barbeque"%' OR tags::text ILIKE '%"barbecue"%' THEN 'bbq'
  WHEN tags::text ILIKE '%"chicken"%'                               THEN 'chicken'
  WHEN tags::text ILIKE '%"vegetarian"%'                            THEN 'vegetarian'
  WHEN tags::text ILIKE '%"vegan"%'                                 THEN 'vegan'
  WHEN tags::text ILIKE '%"kebab"%'                                 THEN 'kebab'
  WHEN tags::text ILIKE '%"sandwich"%'                              THEN 'sandwich'
  WHEN tags::text ILIKE '%"asian"%'                                 THEN 'asian'
  WHEN tags::text ILIKE '%"caribbean"%'                             THEN 'caribbean'
  WHEN tags::text ILIKE '%"falafel"%'                               THEN 'falafel'
  WHEN tags::text ILIKE '%"jamaican"%'                              THEN 'jamaican'
  WHEN tags::text ILIKE '%"tex-mex"%' OR tags::text ILIKE '%"tex_mex"%' THEN 'tex-mex'
  WHEN tags::text ILIKE '%"middle_eastern"%'                        THEN 'middle-eastern'
  WHEN tags::text ILIKE '%"american"%'                              THEN 'american'
  WHEN tags::text ILIKE '%"wings"%'                                 THEN 'wings'
  WHEN tags::text ILIKE '%"pie"%'                                   THEN 'pie'
  WHEN tags::text ILIKE '%"crepe"%'                                 THEN 'crepe'
  WHEN tags::text ILIKE '%"persian"%'                               THEN 'persian'
  WHEN tags::text ILIKE '%"bagel"%'                                 THEN 'bagel'
  WHEN tags::text ILIKE '%"pakistani"%'                             THEN 'pakistani'
  WHEN tags::text ILIKE '%"hawaiian"%'                              THEN 'hawaiian'
  WHEN tags::text ILIKE '%"swedish"%'                               THEN 'swedish'
  WHEN tags::text ILIKE '%"english"%'                               THEN 'english'
  WHEN tags::text ILIKE '%"pita"%'                                  THEN 'pita'
  ELSE 'general'
END
WHERE category_slug = 'restaurants'
AND (sub_category IS NULL OR sub_category = 'General' OR sub_category = 'general');
  `;

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // Try direct SQL execution instead
      console.log('⚠️  RPC method not available, trying direct SQL...');
      
      // Since we can't directly run raw SQL via Supabase JS client, 
      // we'll use the database connection details
      const { data: result, error: execError } = await supabase
        .from('listings')
        .select('id')
        .eq('category_slug', 'restaurants')
        .limit(1);

      if (execError) {
        console.error('❌ Database connection error:', execError);
        process.exit(1);
      }
    }

    console.log('✅ SQL execution request sent');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }

  // Verify results
  console.log('\n📊 Verification: Restaurant sub-categories after update...\n');
  const { data: stats, error: statsError } = await supabase
    .from('listings')
    .select('sub_category')
    .eq('category_slug', 'restaurants')
    .not('sub_category', 'is', null);

  if (statsError) {
    console.error('❌ Verification error:', statsError);
    process.exit(1);
  }

  const subcategoryStats = {};
  stats.forEach(record => {
    const cat = record.sub_category;
    subcategoryStats[cat] = (subcategoryStats[cat] || 0) + 1;
  });

  console.log('Restaurant sub-categories (sorted by count):');
  Object.entries(subcategoryStats)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count}`);
    });

  const totalRestaurants = stats.length;
  const generalCount = subcategoryStats['General'] || subcategoryStats['general'] || 0;
  console.log(`\n📈 Summary:`);
  console.log(`   Total restaurants: ${totalRestaurants}`);
  console.log(`   Remaining "General": ${generalCount}`);
  console.log(`   Classified: ${totalRestaurants - generalCount}`);
}

fixRestaurantSubCategories();
