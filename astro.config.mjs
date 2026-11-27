// @ts-check

import preact from '@astrojs/preact';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://altivia.lat',
  integrations: [preact(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});