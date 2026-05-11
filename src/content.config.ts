import { defineCollection, z } from 'astro:content';
import { createClient } from '@supabase/supabase-js';

const landing = defineCollection({
    loader: {
        name: 'supabase-landing-pages',
        load: async ({ store, logger }) => {
            const supabaseUrl = import.meta.env.SUPABASE_URL;
            const supabaseKey = import.meta.env.SUPABASE_ANON_KEY;

            if (!supabaseUrl || !supabaseKey) {
                logger.warn('SUPABASE_URL / SUPABASE_ANON_KEY not set — landing pages will be empty');
                return;
            }

            const db = createClient(supabaseUrl, supabaseKey);
            const { data, error } = await db
                .from('landing_pages')
                .select('*')
                .eq('status', 'published');

            if (error) {
                logger.warn(`Failed to load landing_pages from Supabase: ${error.message}`);
                return;
            }

            store.clear();
            for (const row of data ?? []) {
                const id = row.area
                    ? `${row.city}--${row.area}--${row.topic}`
                    : `${row.city}--${row.topic}`;

                store.set({
                    id,
                    data: {
                        city:        row.city,
                        area:        row.area ?? undefined,
                        topic:       row.topic,
                        topicType:   row.topic_type,
                        title:       row.title,
                        seoTitle:    row.seo_title,
                        description: row.description,
                        intro:       row.intro,
                        sections:    row.sections ?? [],
                        featuredIds: row.featured_ids?.length ? row.featured_ids : undefined,
                    },
                });
            }

            logger.info(`Loaded ${data?.length ?? 0} landing pages from Supabase`);
        },
    },
    schema: z.object({
        city: z.string(),
        area: z.string().optional(),
        topic: z.string(),
        topicType: z.enum(['category', 'area', 'tag', 'sub_category']),
        title: z.string(),
        seoTitle: z.string(),
        description: z.string(),
        intro: z.string(),
        sections: z.array(
            z.object({
                heading:   z.string(),
                body:      z.string(),
                image_url: z.string().nullable().optional(),
            })
        ).default([]),
        featuredIds: z.array(z.string()).optional(),
    }),
});

export const collections = { landing };
