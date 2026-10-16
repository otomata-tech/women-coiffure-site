// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';
import markdownTwins from './src/integrations/markdown-twins.mjs';

// Domaine définitif de Nathalie, servi par Cloudflare Pages (ADR 0003) ;
// women-coiffure.fr redirige vers www.
// Source UNIQUE de l'URL : canonical, sitemap, robots.txt, llms.txt et JSON-LD
// en dérivent tous (via import.meta.env.SITE, lu dans src/lib/site.ts).
export default defineConfig({
  site: 'https://www.women-coiffure.fr',
  output: 'static',
  integrations: [mdx(), markdownTwins()],
  vite: {
    plugins: [tailwindcss()],
  },
});
