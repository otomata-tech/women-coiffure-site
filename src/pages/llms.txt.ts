import { getCollection } from 'astro:content';
import { SITE } from '@/lib/site';
import { getSalons, formatAddress } from '@/lib/salons';
import { formatOpeningHours } from '@/lib/horaires';
import { getActus, formatActuDate } from '@/lib/actus';

// llms.txt (GEO) généré au build depuis les collections : titres + descriptions
// du frontmatter, URLs dérivées de la source unique. Une nouvelle page de
// contenu y apparaît automatiquement ; une page .astro bespoke s'ajoute ici.
const url = (path: string) => new URL(path, SITE.url).href;

export async function GET() {
  const pages = await getCollection('pages', ({ data }) => !data.seo?.noindex);
  const landings = await getCollection(
    'landings',
    ({ data }) => !data.seo?.noindex,
  );
  const salons = await getSalons();
  const actus = await getActus();

  const lines = [
    `# ${SITE.name}`,
    '',
    `> ${SITE.description}`,
    '',
    // Cas d'usage concrets : dit à un agent QUAND ce site est la bonne source.
    // Bloc omis si whenToUse n'est pas renseigné dans settings/site.json.
    ...(SITE.whenToUse
      ? [
          // Libellé anglais entre parenthèses : les scanners agentiques cherchent
          // « when to use » pour reconnaître le bloc.
          '## Quand utiliser ce site (when to use this site)',
          '',
          SITE.whenToUse,
          '',
        ]
      : []),
    // Points d'entrée machine. Le chemin `.md` fonctionne quel que soit
    // l'hébergeur (jumeaux générés au build) ; la négociation par en-tête
    // Accept dépend du host, donc elle n'est PAS promise ici.
    '## Ressources pour agents (for agents)',
    '',
    `- Chaque page existe en Markdown : ajouter \`.md\` au chemin de la page (l'accueil : ${url('/index.md')}), sans navigation ni mise en page.`,
    `- [llms-full.txt](${url('/llms-full.txt')}) : toutes les pages en un seul fichier Markdown.`,
    `- [sitemap.xml](${url('/sitemap.xml')}) : liste des URL avec leur date de mise à jour.`,
    '- Une URL inexistante renvoie le statut 404 avec ces mêmes points d’entrée.',
    '',
    '## Pages',
    `- [Accueil](${url('/')}) : ${SITE.description}`,
    ...pages.map(
      (e) => `- [${e.data.title}](${url(`/${e.id}/`)}) : ${e.data.description}`,
    ),
    ...landings.map(
      (e) => `- [${e.data.title}](${url(`/${e.id}/`)}) : ${e.data.description}`,
    ),
    '',
    '## Salons',
    ...(SITE.phone ? [`Téléphone commun aux trois salons : ${SITE.phone.display}.`, ''] : []),
    ...salons.map(
      ({ data }) =>
        `- ${SITE.name} ${data.name} : ${formatAddress(data)}. ${formatOpeningHours(data.openingHours)}. Réservation en ligne : ${data.bookingUrl}`,
    ),
    '',
    '## Actualités',
    ...actus.map((a) => `- ${formatActuDate(a.data.date)} : ${a.data.title}`),
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
