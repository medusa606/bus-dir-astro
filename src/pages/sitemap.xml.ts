import type { APIRoute } from 'astro';
import { supabase } from '../lib/supabase.js';

// Taken from `site` in astro.config.mjs — a non-canonical host makes every
// sitemap URL a redirect, which Google logs instead of indexing.
const SITE = new URL(import.meta.env.SITE).origin;

function urlEntry(
    loc: string,
    opts: { priority?: string; changefreq?: string; lastmod?: string } = {}
): string {
    const parts = [`    <loc>${SITE}${loc}</loc>`];
    if (opts.lastmod) parts.push(`    <lastmod>${opts.lastmod}</lastmod>`);
    if (opts.changefreq) parts.push(`    <changefreq>${opts.changefreq}</changefreq>`);
    if (opts.priority) parts.push(`    <priority>${opts.priority}</priority>`);
    return `  <url>\n${parts.join('\n')}\n  </url>`;
}

export const GET: APIRoute = async () => {
    const entries: string[] = [];

    // Static pages
    entries.push(
        urlEntry('/', { priority: '1.0', changefreq: 'weekly' }),
        urlEntry('/search', { priority: '0.6', changefreq: 'monthly' }),
        urlEntry('/privacy', { priority: '0.3', changefreq: 'yearly' }),
        urlEntry('/terms', { priority: '0.3', changefreq: 'yearly' }),
        urlEntry('/accessibility', { priority: '0.3', changefreq: 'yearly' }),
    );

    // Fetch all active listings (paginate past Supabase 1000-row limit)
    const PAGE_SIZE = 1000;
    let offset = 0;
    let hasMore = true;

    const cities = new Set<string>();
    const areas = new Set<string>();
    const categories = new Set<string>();
    const listingEntries: string[] = [];

    while (hasMore) {
        // Mirrors the browse pages: listings with no address are deliberately not
        // surfaced anywhere on the site, so don't submit them for indexing either.
        // Deriving cities/areas/categories from the same rows also keeps empty
        // browse pages out of the sitemap.
        const { data: rows, error } = await supabase
            .from('listings')
            .select('business_slug, city_slug, area_slug, category_slug')
            .or('status.not.in.(closed,unverified),status.is.null')
            .not('address', 'is', null)
            .range(offset, offset + PAGE_SIZE - 1);

        if (error || !rows?.length) { hasMore = false; break; }

        for (const r of rows) {
            if (r.city_slug) cities.add(r.city_slug);
            if (r.city_slug && r.area_slug) areas.add(`${r.city_slug}/${r.area_slug}`);
            if (r.city_slug && r.category_slug) categories.add(`${r.city_slug}/${r.category_slug}`);
            if (r.city_slug && r.area_slug && r.business_slug) {
                listingEntries.push(
                    urlEntry(`/${r.city_slug}/${r.area_slug}/${r.business_slug}`, {
                        priority: '0.8',
                        changefreq: 'monthly',
                    })
                );
            }
        }

        if (rows.length < PAGE_SIZE) { hasMore = false; } else { offset += PAGE_SIZE; }
    }

    // City index pages
    for (const city of cities) {
        entries.push(urlEntry(`/${city}`, { priority: '0.9', changefreq: 'weekly' }));
    }

    // Area browse pages
    for (const area of areas) {
        entries.push(urlEntry(`/${area}`, { priority: '0.8', changefreq: 'weekly' }));
    }

    // Category browse pages
    for (const cat of categories) {
        entries.push(urlEntry(`/${cat}`, { priority: '0.7', changefreq: 'weekly' }));
    }

    // Individual listing pages
    entries.push(...listingEntries);

    // Published landing pages (include lastmod from updated_at)
    const { data: landingPages } = await supabase
        .from('landing_pages')
        .select('city, slug, updated_at')
        .eq('status', 'published');

    for (const lp of landingPages ?? []) {
        if (lp.city && lp.slug) {
            const lastmod = lp.updated_at ? lp.updated_at.slice(0, 10) : undefined;
            entries.push(
                urlEntry(`/${lp.city}/${lp.slug}`, {
                    priority: '0.9',
                    changefreq: 'weekly',
                    lastmod,
                })
            );
        }
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>`;

    return new Response(xml, {
        headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        },
    });
};
