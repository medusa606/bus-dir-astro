import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
    site: 'https://curatedlocale.uk',
    output: 'server',
    adapter: cloudflare({
        imageService: 'passthrough',   // no Cloudflare Images binding needed
    }),
    trailingSlash: 'never',
    prefetch: {
        defaultStrategy: 'hover'
    },
    integrations: [sitemap()],
    vite: {
        server: {
            allowedHosts: true
        }
    }
});
