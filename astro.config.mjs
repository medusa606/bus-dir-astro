import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
    site: 'https://meridian-directory.pages.dev',
    output: 'static',
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
