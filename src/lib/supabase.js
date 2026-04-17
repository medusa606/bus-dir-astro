import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_ANON_KEY
);

/**
 * Get the public URL for a file in the listing-illustrations storage bucket.
 * @param {string} fileName - e.g. 'no12-cafe-easton.webp'
 * @returns {string} Public URL
 */
export function getIllustrationUrl(fileName) {
    const { data } = supabase.storage
        .from('listing-illustrations')
        .getPublicUrl(fileName);
    return data?.publicUrl || null;
}

/**
 * Get the public URL for a file in the area-heroes storage bucket.
 * @param {string} fileName - e.g. 'bristol-easton.jpg'
 * @returns {string} Public URL
 */
export function getAreaHeroUrl(fileName) {
    const { data } = supabase.storage
        .from('area-heroes')
        .getPublicUrl(fileName);
    return data?.publicUrl || null;
}
