// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';
import markdownTwins from './src/integrations/markdown-twins.mjs';

// URL PROVISOIRE : le domaine définitif de WOMEN Coiffure n'est pas encore
// choisi. Le remplacer ici, et ici seulement, le jour où il l'est.
// Source UNIQUE de l'URL : canonical, sitemap, robots.txt, llms.txt et JSON-LD
// en dérivent tous (via import.meta.env.SITE, lu dans src/lib/site.ts).
export default defineConfig({
  site: 'https://women-coiffure.oto.zone',
  output: 'static',
  integrations: [mdx(), markdownTwins()],
  vite: {
    plugins: [tailwindcss()],
  },
});
