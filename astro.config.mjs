// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';
import markdownTwins from './src/integrations/markdown-twins.mjs';

// URL PROVISOIRE (démo). Domaine définitif acheté par Nathalie :
// https://www.women-coiffure.fr — à poser ici, et ici seulement, le jour où le
// site y est servi. Pas avant : og:image, canonical et liens de llms.txt
// pointeraient vers un domaine qui ne sert pas encore le site (aperçus de
// partage de la démo cassés).
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
