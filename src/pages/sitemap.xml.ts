import { getCollection, getEntry } from 'astro:content';
import { getActus } from '@/lib/actus';
import { SITE } from '@/lib/site';

// Sitemap custom (remplace @astrojs/sitemap) pour émettre un <lastmod> par
// page depuis updatedDate/pubDate (signal de fraîcheur) et exclure les pages
// noindex. Les collections sont découvertes automatiquement ; toute NOUVELLE
// page .astro bespoke doit être ajoutée à bespoke() ci-dessous.
async function bespoke(): Promise<{ path: string; lastmod?: Date }[]> {
  // Accueil : lastmod = updatedDate de accueil.md, ou date de l'actu la plus récente.
  const accueil = await getEntry('accueil', 'accueil');
  const latestActu = (await getActus())[0];
  const dates = [
    accueil?.data.updatedDate,
    latestActu ? new Date(latestActu.data.date.iso) : undefined,
  ].filter((d): d is Date => !!d);
  return [{ path: '/', lastmod: dates.sort((a, b) => b.getTime() - a.getTime())[0] }];
}

const day = (d: Date) => d.toISOString().slice(0, 10);

export async function GET() {
  const pages = await getCollection('pages', ({ data }) => !data.seo?.noindex);
  const landings = await getCollection(
    'landings',
    ({ data }) => !data.seo?.noindex,
  );

  const urls: { path: string; lastmod?: Date }[] = [
    ...(await bespoke()),
    ...pages.map((e) => ({
      path: `/${e.id}/`,
      lastmod: e.data.updatedDate,
    })),
    ...landings.map((e) => ({
      path: `/${e.id}/`,
      lastmod: e.data.updatedDate,
    })),
  ];

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map(
      (u) =>
        `  <url><loc>${new URL(u.path, SITE.url).href}</loc>${
          u.lastmod ? `<lastmod>${day(u.lastmod)}</lastmod>` : ''
        }</url>`,
    ),
    '</urlset>',
    '',
  ].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
