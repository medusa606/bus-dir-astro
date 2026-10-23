import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function check() {
  const tableNames = ['listings', 'listings_backup', 'listings_archive', 'listings_old'];
  
  for (const tableName of tableNames) {
    try {
      const { count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });
      
      if (!error) {
        console.log(`${tableName}: ${count} records`);
      }
    } catch (e) {
      // Table doesn't exist
    }
  }
}

check();
