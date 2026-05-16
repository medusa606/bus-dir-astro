#!/usr/bin/env node
/**
 * precompute-relations.js
 *
 * Computes nearby_ids, nearby_distances, and similar_ids for every active listing
 * and writes them back to Supabase in batches.
 *
 * Run manually after bulk data changes:
 *   node scripts/precompute-relations.js
 *
 * Prerequisites:
 *   1. Run scripts/add-precomputed-relations.sql in Supabase first.
 *   2. SUPABASE_URL and SUPABASE_SERVICE_KEY (or SUPABASE_ANON_KEY) in .env
 *      Use the service key so RLS doesn't block the bulk update.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
// Prefer service key for bulk writes; fall back to anon key
const supabaseKey =
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌  Missing SUPABASE_URL / SUPABASE_SERVICE_KEY in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ── Constants ────────────────────────────────────────────────────────────────
const NEARBY_RADIUS_M  = 500;
const NEARBY_LIMIT     = 8;
const SIMILAR_LIMIT    = 6;
const BATCH_SIZE       = 50;   // rows per upsert batch

const TIER_SCORE  = { editors_choice: 100, recommended: 50, google_ranked: 10, standard: 0 };
const TIER_RANK   = { editors_choice: 0, recommended: 1, google_ranked: 2, standard: 3 };

const SLUG_ALIASES = {
    'health-wellbeing': 'health-and-wellbeing',
    'restaurant': 'restaurants',
    'restaurants-and-cafes': 'restaurants',
    'fitness-and-sports': 'sports-and-recreation',
};
function normaliseCategory(slug) {
    if (!slug) return slug;
    return SLUG_ALIASES[slug] || slug;
}

function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const toRad = d => d * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Compute completeness + quality score for a candidate listing.
 * Higher = better match for "similar" recommendations.
 */
function computeSimilarityScore(candidate, current) {
    let score = 0;

    // ── Editorial tier ────────────────────────────────────────────────────
    score += TIER_SCORE[candidate.ranking_tier] ?? 0;

    // ── Relevance: sub_category exact match ───────────────────────────────
    if (
        current.sub_category &&
        candidate.sub_category &&
        candidate.sub_category.toLowerCase() === current.sub_category.toLowerCase()
    ) {
        score += 15;
    }

    // ── Relevance: shared tags ─────────────────────────────────────────────
    const currentTags = new Set(current.tags || []);
    const sharedTags = (candidate.tags || []).filter(t => currentTags.has(t)).length;
    score += sharedTags * 5;

    // ── Google social proof ───────────────────────────────────────────────
    if (candidate.google_rating) {
        score += 15; // has a rating at all
        if (candidate.google_rating >= 4.5) score += 10;
        else if (candidate.google_rating >= 4.0) score += 5;
    }
    const rc = candidate.google_review_count || 0;
    if (rc >= 200) score += 12;
    else if (rc >= 50)  score += 8;
    else if (rc >= 10)  score += 4;

    // ── Profile completeness ──────────────────────────────────────────────
    if (candidate.description)                            score += 10;
    if (candidate.image_url)                               score += 6;
    const hasSocial =
        candidate.social_facebook  ||
        candidate.social_instagram ||
        candidate.social_twitter   ||
        candidate.social_tiktok    ||
        candidate.social_linkedin  ||
        candidate.social_youtube;
    if (hasSocial)                                        score += 8;
    if (candidate.website)                                score += 4;
    if (candidate.phone)                                  score += 3;
    const hasBooking =
        candidate.booking_opentable    ||
        candidate.booking_firsttable   ||
        candidate.booking_resdiary     ||
        candidate.booking_thefork      ||
        candidate.booking_sevenrooms   ||
        candidate.booking_quandoo      ||
        candidate.booking_resy         ||
        candidate.booking_designmynight;
    if (hasBooking)                                       score += 6;

    return score;
}

// ── Fetch all listings ───────────────────────────────────────────────────────
async function fetchAllListings() {
    const PAGE_SIZE = 1000;
    let all = [];
    let from = 0;
    while (true) {
        const { data, error } = await supabase
            .from('listings')
            .select(`
                id, name, business_slug, city_slug, area_slug,
                category_slug, sub_category, tags, ranking_tier,
                latitude, longitude,
                google_rating, google_review_count,
                description, image_url, website, phone,
                social_facebook, social_instagram, social_twitter,
                social_tiktok, social_linkedin, social_youtube,
                booking_opentable, booking_firsttable, booking_resdiary,
                booking_thefork, booking_sevenrooms, booking_quandoo,
                booking_resy, booking_designmynight
            `)
            .or('status.not.in.(closed,unverified),status.is.null')
            .range(from, from + PAGE_SIZE - 1);
        if (error) { console.error('Fetch error:', error); process.exit(1); }
        if (!data || data.length === 0) break;
        all = all.concat(data);
        if (data.length < PAGE_SIZE) break;
        from += PAGE_SIZE;
    }
    return all;
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
    console.log('⏳  Fetching all listings…');
    const allListings = await fetchAllListings();
    console.log(`✅  ${allListings.length} listings loaded`);

    const updates = [];

    for (const listing of allListings) {
        // ── Nearby ─────────────────────────────────────────────────────────
        let nearby_ids = null;
        let nearby_distances = null;

        if (listing.latitude && listing.longitude) {
            const candidates = allListings
                .filter(o =>
                    o.id !== listing.id &&
                    o.latitude && o.longitude
                )
                .map(o => ({
                    id: o.id,
                    distance: Math.round(haversineDistance(
                        listing.latitude, listing.longitude,
                        o.latitude, o.longitude
                    )),
                    tierRank: TIER_RANK[o.ranking_tier] ?? 3,
                }))
                .filter(o => o.distance <= NEARBY_RADIUS_M)
                .sort((a, b) => a.tierRank - b.tierRank || a.distance - b.distance)
                .slice(0, NEARBY_LIMIT);

            if (candidates.length > 0) {
                nearby_ids       = candidates.map(c => c.id);
                nearby_distances = candidates.map(c => c.distance);
            }
        }

        // ── Similar ────────────────────────────────────────────────────────
        let similar_ids = null;
        const normCat = normaliseCategory(listing.category_slug);

        const similars = allListings
            .filter(o =>
                o.id !== listing.id &&
                normaliseCategory(o.category_slug) === normCat
            )
            .map(o => ({
                id: o.id,
                score: computeSimilarityScore(o, listing),
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, SIMILAR_LIMIT);

        if (similars.length > 0) {
            similar_ids = similars.map(s => s.id);
        }

        updates.push({ id: listing.id, name: listing.name, nearby_ids, nearby_distances, similar_ids });
    }

    // ── Batch upsert ───────────────────────────────────────────────────────
    console.log(`⏳  Writing ${updates.length} rows in batches of ${BATCH_SIZE}…`);
    let written = 0;
    for (let i = 0; i < updates.length; i += BATCH_SIZE) {
        const batch = updates.slice(i, i + BATCH_SIZE);
        const { error } = await supabase
            .from('listings')
            .upsert(batch, { onConflict: 'id' });
        if (error) {
            console.error(`❌  Batch ${i / BATCH_SIZE + 1} failed:`, error.message);
        } else {
            written += batch.length;
            process.stdout.write(`\r   ${written}/${updates.length}`);
        }
    }

    console.log(`\n✅  Done. ${written} listings updated.`);
}

main().catch(err => { console.error(err); process.exit(1); });
