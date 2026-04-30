#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixRLSAndNormalize() {
  console.log('🔧 Fixing RLS and normalizing sub_category...\n');

  // Step 1: Create a SELECT policy for anon key (instead of disabling RLS)
  console.log('1️⃣  Adding SELECT policy for anon key...');
  
  const policySQL = `
    -- Enable RLS if not already enabled
    ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
    
    -- Drop existing anon SELECT policy if it exists
    DROP POLICY IF EXISTS "anon_select_listings" ON public.listings;
    
    -- Create new SELECT policy for anon key
    CREATE POLICY "anon_select_listings" ON public.listings
      FOR SELECT
      USING (true);
  `;

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: policySQL });
    if (error) {
      console.log('⚠️  RPC method not available, using fallback...');
    } else {
      console.log('✅ SELECT policy created for anon key');
    }
  } catch (e) {
    console.log('⚠️  Could not create policy via RPC. Using direct SQL...');
    // Fallback: just update the sub_category records
  }

  // Step 2: Normalize sub_category to lowercase
  console.log('\n2️⃣  Normalizing sub_category to lowercase...');

  // Fetch all records with mixed-case sub_category
  const { data: records } = await supabase
    .from('listings')
    .select('id, sub_category')
    .not('sub_category', 'is', null);

  if (!records || records.length === 0) {
    console.log('✅ No records to normalize');
  } else {
    let normalized = 0;
    const batchSize = 50;

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);

      for (const record of batch) {
        const normalized_value = record.sub_category.toLowerCase();
        
        // Only update if different
        if (normalized_value !== record.sub_category) {
          const { error } = await supabase
            .from('listings')
            .update({ sub_category: normalized_value })
            .eq('id', record.id);

          if (!error) {
            normalized++;
          }
        }
      }

      const progress = Math.min(i + batchSize, records.length);
      if ((i / batchSize + 1) % 5 === 0 || i + batchSize >= records.length) {
        console.log(`  ✓ Processed ${progress}/${records.length} records (${normalized} normalized)...`);
      }

      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`\n✅ Normalized ${normalized} sub_category values to lowercase`);
  }

  // Step 3: Verify anon key can now read
  console.log('\n3️⃣  Verifying anon key access...');
  
  const supabaseAnon = createClient(supabaseUrl, process.env.SUPABASE_ANON_KEY);
  const { count, error } = await supabaseAnon
    .from('listings')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.log('❌ Anon key still blocked:', error.message);
    console.log('\n💡 If policy creation failed, you may need to manually run:');
    console.log('   ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;');
    console.log('   CREATE POLICY "anon_select_listings" ON public.listings FOR SELECT USING (true);');
  } else {
    console.log(`✅ Anon key can now read ${count} records!`);
  }

  console.log('\n✨ Done!');
}

fixRLSAndNormalize();
