import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
    site: 'https://curatedlocale.uk',
    output: 'hybrid',
    adapter: cloudflare(),
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
