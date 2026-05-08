import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase
    .from('listings')
    .select('id, name, business_slug, status, delivery_deliveroo, delivery_ubereats')
    .like('business_slug', '%parsons%');
    
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Found listings:');
    console.log(JSON.stringify(data, null, 2));
  }
}

check();
