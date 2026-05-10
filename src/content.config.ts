import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const landing = defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/landing' }),
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
                heading: z.string(),
                body: z.string(),
            })
        ).default([]),
        featuredIds: z.array(z.string()).optional(),
    }),
});

export const collections = { landing };
