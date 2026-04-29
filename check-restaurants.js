import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  // Check category values that exist
  const { data: categories } = await supabase
    .from('listings')
    .select('category_slug')
    .limit(10);
  
  console.log('Sample category_slug values:', categories?.map(c => c.category_slug));

  // Count all records
  const { count: totalCount } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true });
  
  console.log(`\nTotal listings in DB: ${totalCount}`);

  // Check if there are any restaurants at all
  const { count: restaurantCount } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true })
    .or("category_slug.eq.restaurants,category.eq.restaurants");
  
  console.log(`Restaurants (any case): ${restaurantCount}`);

  // Get unique category values
  const { data: allCategories } = await supabase
    .from('listings')
    .select('category, category_slug')
    .limit(100);
  
  const uniqueCategories = [...new Set(allCategories?.map(c => c.category_slug))];
  console.log(`\nUnique category_slug values:`, uniqueCategories);
}

check();
