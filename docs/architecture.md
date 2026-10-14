# Architecture

## Invariants (ne pas violer sans ADR)
1. output: static, aucun runtime serveur.
2. SEO + JSON-LD centralisés dans BaseLayout (src/layouts/BaseLayout.astro).
3. Contenu en collections typées (src/content.config.ts) ; présentation séparée (composants/tokens).
4. Routing : / (accueil bespoke), [...slug] racine (landings + pages, vides). Pas de second catch-all racine.
5. Interactivité = par défaut AUCUNE (statique) ; sinon <script> vanilla dans le .astro. Îlots Solid = starter opt-in, seulement si nécessaire.

## Arbre
- src/pages : routes (index, [...slug], 404, styleguide) + routes générées (sitemap.xml, robots.txt, llms.txt)
- src/content : salons/ actus/ accueil/ pages/ landings/ settings/ + content.config.ts
- src/layouts : BaseLayout
- src/components : ui/ seo/ landing/ sections/ home/ (blocs de l'accueil)
- src/lib : site.ts (valide settings/site.json par Zod, URL depuis astro.config, logo), seo.ts, chrome.ts, salons.ts, actus.ts, horaires.ts, phone.ts, authors.ts (dormant : plus de blog)
- src/styles : global.css (tokens Tailwind 4)
- public : favicon.png, og-default.jpg, logo.svg, fonts/

## Intégrations Astro installées
mdx, markdown-twins (jumeaux .md + llms-full.txt). @tailwindcss/vite côté Vite. sitemap/robots/llms = routes custom src/pages/*.ts. Plus de RSS (blog retiré).

## Inclus dans le socle
pages, landings, SEO/JSON-LD, sitemap, réglages globaux (settings/site.json) ; propre au site : collections salons, actus, accueil. Composant ContactForm conservé (galerie) mais non utilisé.

## Starters opt-in (non installés)
solid (îlots), i18n (multilingue). Voir .claude/starters/.
Édition de contenu : directe dans les fichiers (pas d'interface d'admin).
