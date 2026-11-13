// @ts-check

import preact from '@astrojs/preact';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://altivia.lat',
  integrations: [preact()],
  vite: {
    plugins: [tailwindcss()],
  },
});
