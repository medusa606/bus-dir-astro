#!/usr/bin/env node
/**
 * Illustration Generation Pipeline
 *
 * Queries Supabase for listings flagged with add_listing_illustration = true
 * and illustration_status = 'pending', generates cell-shaded illustrations
 * via the configured image API, uploads to Supabase Storage, and updates
 * the listing row.
 *
 * Usage:
 *   node scripts/generate-illustrations.js
 *
 * Env vars (see .env.example):
 *   SUPABASE_URL, SUPABASE_SERVICE_KEY,
 *   ILLUSTRATION_API_PROVIDER  (google | huggingface)
 *   ILLUSTRATION_API_KEY
 *   ILLUSTRATION_DAILY_LIMIT   (default 5)
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY; // service role key for writes
const API_PROVIDER = process.env.ILLUSTRATION_API_PROVIDER || 'google';
const API_KEY = process.env.ILLUSTRATION_API_KEY;
const DAILY_LIMIT = parseInt(process.env.ILLUSTRATION_DAILY_LIMIT || '5', 10);
const STORAGE_BUCKET = 'listing-illustrations';

// Brand colour prompt fragment derived from global.css
const STYLE_PROMPT =
    'Draw this photo in a cell-shaded, illustration style. ' +
    'Harmonise with these brand colours: taupe #463f3a, parchment #f4f3ee, ' +
    'powder-blush #e0afa0, grey-olive #8a817c. ' +
    'Remove any image artifacts in the photo beforehand. ' +
    'Do not add any writing that isn\'t in the photo already.';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ---------------------------------------------------------------------------
// Provider: Google Gemini / Imagen 3 (free‑tier via AI Studio)
// ---------------------------------------------------------------------------

async function generateWithGoogle(sourcePhotoUrl) {
    const endpoint =
        'https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict';

    const body = {
        instances: [
            {
                prompt: STYLE_PROMPT,
                image: { source: { imageUri: sourcePhotoUrl } },
            },
        ],
        parameters: {
            sampleCount: 1,
            aspectRatio: '16:9',
        },
    };

    const res = await fetch(`${endpoint}?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Google API ${res.status}: ${text}`);
    }

    const json = await res.json();
    // Imagen returns base64-encoded image bytes
    const b64 = json.predictions?.[0]?.bytesBase64Encoded;
    if (!b64) throw new Error('No image returned from Google API');
    return Buffer.from(b64, 'base64');
}

// ---------------------------------------------------------------------------
// Provider: HuggingFace Inference API (Stable Diffusion XL img2img)
// ---------------------------------------------------------------------------

async function generateWithHuggingFace(sourcePhotoUrl) {
    const model = 'stabilityai/stable-diffusion-xl-base-1.0';
    const endpoint = `https://api-inference.huggingface.co/models/${model}`;

    // Download source image as base64
    const imgRes = await fetch(sourcePhotoUrl);
    if (!imgRes.ok) throw new Error(`Failed to download source photo: ${imgRes.status}`);
    const imgBuf = Buffer.from(await imgRes.arrayBuffer());
    const imgB64 = imgBuf.toString('base64');

    const body = {
        inputs: STYLE_PROMPT,
        parameters: {
            image: imgB64,
            strength: 0.65,        // how much to transform (0 = keep original, 1 = full regen)
            guidance_scale: 7.5,
            num_inference_steps: 30,
        },
    };

    const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`HuggingFace API ${res.status}: ${text}`);
    }

    // HuggingFace returns raw image bytes
    return Buffer.from(await res.arrayBuffer());
}

// ---------------------------------------------------------------------------
// Provider dispatcher
// ---------------------------------------------------------------------------

const PROVIDERS = {
    google: generateWithGoogle,
    huggingface: generateWithHuggingFace,
};

async function generateIllustration(sourcePhotoUrl) {
    const fn = PROVIDERS[API_PROVIDER];
    if (!fn) {
        throw new Error(`Unknown ILLUSTRATION_API_PROVIDER: ${API_PROVIDER}`);
    }
    return fn(sourcePhotoUrl);
}

// ---------------------------------------------------------------------------
// Upload to Supabase Storage
// ---------------------------------------------------------------------------

async function uploadToStorage(slug, imageBuffer) {
    const fileName = `${slug}.webp`;

    const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(fileName, imageBuffer, {
            contentType: 'image/webp',
            upsert: true,
        });

    if (error) throw new Error(`Storage upload failed: ${error.message}`);

    const { data } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(fileName);

    return data.publicUrl;
}

// ---------------------------------------------------------------------------
// Main pipeline
// ---------------------------------------------------------------------------

async function main() {
    console.log(`[illustrations] Starting pipeline — provider=${API_PROVIDER}, limit=${DAILY_LIMIT}`);

    // 1. Check how many were already generated today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { count: todayCount } = await supabase
        .from('listings')
        .select('id', { count: 'exact', head: true })
        .eq('illustration_status', 'completed')
        .gte('illustration_generated_at', todayStart.toISOString());

    const remaining = DAILY_LIMIT - (todayCount || 0);
    if (remaining <= 0) {
        console.log(`[illustrations] Daily limit reached (${DAILY_LIMIT}). Exiting.`);
        return;
    }

    // 2. Fetch pending listings
    const { data: pending, error: fetchErr } = await supabase
        .from('listings')
        .select('id, business_slug, image_url, photo_url')
        .eq('add_listing_illustration', true)
        .eq('illustration_status', 'pending')
        .limit(remaining);

    if (fetchErr) {
        console.error('[illustrations] Fetch error:', fetchErr.message);
        process.exit(1);
    }

    if (!pending || pending.length === 0) {
        console.log('[illustrations] No pending illustrations. Done.');
        return;
    }

    console.log(`[illustrations] Processing ${pending.length} listing(s)…`);

    let successes = 0;
    let failures = 0;

    for (const listing of pending) {
        const slug = listing.business_slug;
        const sourcePhoto = listing.image_url || listing.photo_url;

        if (!sourcePhoto) {
            console.warn(`[illustrations] ${slug}: No source photo — skipping`);
            await supabase
                .from('listings')
                .update({ illustration_status: 'failed' })
                .eq('id', listing.id);
            failures++;
            continue;
        }

        try {
            // Mark as generating
            await supabase
                .from('listings')
                .update({ illustration_status: 'generating' })
                .eq('id', listing.id);

            console.log(`[illustrations] ${slug}: Generating from ${sourcePhoto.slice(0, 60)}…`);

            const imageBuffer = await generateIllustration(sourcePhoto);

            console.log(`[illustrations] ${slug}: Uploading (${(imageBuffer.length / 1024).toFixed(0)} KB)…`);

            const publicUrl = await uploadToStorage(slug, imageBuffer);

            // Update listing with the illustration URL
            await supabase
                .from('listings')
                .update({
                    illustration_url: publicUrl,
                    illustration_status: 'completed',
                    illustration_source_photo: sourcePhoto,
                    illustration_generated_at: new Date().toISOString(),
                })
                .eq('id', listing.id);

            console.log(`[illustrations] ${slug}: Done → ${publicUrl}`);
            successes++;
        } catch (err) {
            console.error(`[illustrations] ${slug}: FAILED —`, err.message);
            await supabase
                .from('listings')
                .update({ illustration_status: 'failed' })
                .eq('id', listing.id);
            failures++;
        }
    }

    console.log(`[illustrations] Pipeline complete: ${successes} succeeded, ${failures} failed`);
}

main().catch((err) => {
    console.error('[illustrations] Unhandled error:', err);
    process.exit(1);
});
