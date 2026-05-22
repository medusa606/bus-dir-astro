import { defineConfig } from 'astro/config';
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
    integrations: [],
    vite: {
        server: {
            allowedHosts: true
        }
    }
});
