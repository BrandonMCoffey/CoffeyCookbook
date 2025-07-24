// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import rehypeExternalLinks from 'rehype-external-links';

export default defineConfig({
    site: 'https://brandoncoffey.com',
    integrations: [react(), tailwind(), sitemap(),
        mdx({
            rehypePlugins: [
                [rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }],
            ],
        }),
    ],
});