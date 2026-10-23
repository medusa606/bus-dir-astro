import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('Testing query for "the-kandyan"...\n');
  
  const { data, error } = await supabase
    .from('listings')
    .select('id, name, business_slug, status, delivery_deliveroo, delivery_ubereats, delivery_opentable')
    .eq('business_slug', 'the-kandyan')
    .or('status.not.in.(closed,unverified),status.is.null')
    .single();
    
  console.log('Error:', error);
  console.log('Data:', JSON.stringify(data, null, 2));
}

test();
