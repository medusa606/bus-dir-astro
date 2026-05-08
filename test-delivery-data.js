import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testDeliveryData() {
  console.log('🔍 Testing delivery data in database...\n');
  
  // Get ALL listings that have ANY delivery URL populated
  const { data, error, count } = await supabase
    .from('listings')
    .select('id, name, business_slug, status, delivery_deliveroo, delivery_ubereats, delivery_opentable', { count: 'exact' })
    .or('delivery_deliveroo.not.is.null,delivery_ubereats.not.is.null,delivery_opentable.not.is.null')
    .limit(20);

  if (error) {
    console.error('❌ Error fetching data:', error);
    return;
  }

  console.log(`✅ Found ${count} total listings with delivery data\n`);
  console.log(`📋 Showing first ${data?.length || 0} listings:\n`);
  
  if (!data || data.length === 0) {
    console.log('❌ No delivery data found!');
    return;
  }

  data.forEach((listing, idx) => {
    console.log(`${idx + 1}. ${listing.name} (${listing.business_slug})`);
    console.log(`   Status: ${listing.status}`);
    console.log(`   Deliveroo: ${listing.delivery_deliveroo ? '✓ ' + listing.delivery_deliveroo : '✗ null'}`);
    console.log(`   UberEats: ${listing.delivery_ubereats ? '✓ ' + listing.delivery_ubereats : '✗ null'}`);
    console.log(`   OpenTable: ${listing.delivery_opentable ? '✓ ' + listing.delivery_opentable : '✗ null'}`);
    console.log('');
  });
}

testDeliveryData();
