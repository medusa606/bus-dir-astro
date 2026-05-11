import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
    site: 'https://meridian-directory.pages.dev',
    output: 'static',
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
