import { createClient } from '@supabase/supabase-js';

// Uses PUBLIC_ prefixed env vars — safe to ship to the browser.
// The Supabase anon key is designed to be public; Row Level Security
// on the `listings` table controls what anonymous users can read.
export const browserSupabase = createClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY
);
