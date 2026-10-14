import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { sectionSchema } from '@/lib/sections';

// --- Blocs réutilisables -------------------------------------------------

// Bloc SEO commun à tous les types de contenu.
const seoSchema = z
  .object({
    title: z.string().max(70).optional(), // override du <title>
    description: z.string().max(170).optional(), // override de la meta description
    canonical: z.string().url().optional(),
    ogImage: z.string().optional(), // chemin override de l'image Open Graph
    noindex: z.boolean().default(false),
  })
  .optional();

// FAQ : rendue visuellement ET en JSON-LD FAQPage (SEO rich results + GEO).
const faqSchema = z
  .array(z.object({ q: z.string(), a: z.string() }))
  .optional();

// --- Collections ---------------------------------------------------------

// Pages éditoriales statiques : à propos, mentions légales, etc. (Markdown).
const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    updatedDate: z.coerce.date().optional(),
    tldr: z.string().optional(),
    faq: faqSchema,
    // Page-builder optionnel : mêmes sections que les landings (même registre).
    sections: z.array(sectionSchema).default([]),
    seo: seoSchema,
  }),
});

// Landing pages (MDX) : frontmatter structuré + corps MDX pour le sur-mesure.
const landings = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/landings' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      updatedDate: z.coerce.date().optional(), // bump à chaque MAJ → lastmod sitemap
      tldr: z.string().optional(),
      topics: z.array(z.string()).default([]),
      hero: z
        .object({
          eyebrow: z.string().optional(),
          headline: z.string(),
          subheadline: z.string().optional(),
          cta: z.object({ label: z.string(), href: z.string() }).optional(),
          image: image().optional(),
          imageAlt: z.string().optional(), // obligatoire dès que image est fournie
        })
        .refine((h) => !h.image || !!h.imageAlt, {
          message: 'hero.imageAlt est requis quand hero.image est défini',
          path: ['imageAlt'],
        }),
      // Page-builder léger : chaque section est mappée à un composant par le
      // registre src/lib/sections.ts (source unique schéma + composant).
      sections: z.array(sectionSchema).default([]),
      // Données pour le JSON-LD (Service ou Product).
      schema: z
        .object({
          type: z.enum(['Service', 'Product']),
          name: z.string(),
          provider: z.string().optional(),
        })
        .optional(),
      seo: seoSchema,
    }),
});

// --- Collections propres à WOMEN Coiffure ------------------------------------
// Tout le texte de l'accueil vit dans ces trois collections (règle absolue 3) :
// la page src/pages/index.astro ne fait que les assembler.

// Jours d'ouverture : valeurs françaises (lues par l'éditrice), converties en
// jours schema.org pour le JSON-LD par src/lib/horaires.ts.
const jour = z.enum(['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']);
const heure = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'heure au format HH:MM, ex. 09:00');
const noteAvis = z.object({
  rating: z.number().min(0).max(5), // note moyenne, ex. 4.9
  count: z.number().int().nonnegative(), // nombre d'avis
});
// Recadrage d'une photo dans son cadre (CSS object-position), ex. "center 40%".
const cadrage = z
  .string()
  .regex(/^[a-z0-9.% ]+$/, 'cadrage CSS attendu, ex. "center 40%"')
  .optional();

// Un salon = une fiche : carte « Choisissez votre salon », galerie « Entrez chez
// nous », lien de réservation du pied de page et nœud HairSalon du JSON-LD.
const salons = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/salons' }),
  schema: ({ image }) =>
    z.object({
      order: z.number().int(), // ordre d'affichage (1 = premier)
      name: z.string(), // nom affiché : « La Londe-les-Maures »
      shortName: z.string(), // nom court des boutons : « La Londe »
      team: z
        .array(z.object({ name: z.string(), specialty: z.string() }))
        .min(1),
      address: z.object({
        streetAddress: z.string(),
        postalCode: z.string().regex(/^\d{5}$/),
        addressLocality: z.string(),
      }),
      mapsUrl: z.string().url(),
      // Plages d'ouverture ; le texte affiché (« Du lundi au samedi, 9h–18h ·
      // fermé le mercredi ») en est dérivé, jamais saisi à la main.
      openingHours: z
        .array(z.object({ days: z.array(jour).min(1), opens: heure, closes: heure }))
        .min(1),
      reviews: z.object({ google: noteAvis, planity: noteAvis }),
      bookingUrl: z.string().url(), // agenda Planity du salon
      photo: image(),
      photoAlt: z.string(),
      photoPosition: cadrage,
      gallery: z
        .array(
          z.object({
            image: image(),
            alt: z.string(),
            caption: z.string(),
            // big = 2×2 cases, wide = 2 cases en largeur (bureau seulement ;
            // sur mobile la galerie devient un carrousel).
            size: z.enum(['normal', 'big', 'wide']).default('normal'),
            position: cadrage,
          }),
        )
        .min(1),
    }),
});

// Date d'une actu : jour précis (AAAA-MM-JJ) ou mois seul (AAAA-MM). YAML lit
// une date complète non quotée comme un Date, d'où l'union.
const dateActu = z.union([
  z.date().transform((d) => ({ iso: d.toISOString().slice(0, 10), precision: 'day' as const })),
  z
    .string()
    .regex(/^\d{4}-\d{2}(-\d{2})?$/, 'date AAAA-MM-JJ ou AAAA-MM')
    .transform((s) => ({ iso: s, precision: s.length === 7 ? ('month' as const) : ('day' as const) })),
]);

// Une actu = un fichier ; le corps Markdown est le texte de l'actu.
const actus = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/actus' }),
  schema: z.object({
    title: z.string(),
    date: dateActu,
    tag: z.string(), // étiquette courte : Gamme, Boutique, Événementiel…
    link: z.object({ label: z.string(), href: z.string() }).optional(),
  }),
});

// Textes et visuels de la page d'accueil (fichier unique accueil.md).
const titreDeBloc = { eyebrow: z.string(), title: z.string() };
const lien = z.object({ label: z.string(), href: z.string() });
const accueil = defineCollection({
  loader: glob({ pattern: 'accueil.md', base: './src/content/accueil' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(), // <title> de l'accueil (suivi de « | WOMEN Coiffure »)
      updatedDate: z.coerce.date(), // bump à chaque MAJ → lastmod sitemap
      hero: z.object({
        banner: image(),
        bannerAlt: z.string(),
        eyebrow: z.string(),
        title: z.string(),
        titleEmphasis: z.string(), // fin du titre, en italique doré
        lead: z.string(),
        ctaLabel: z.string(), // bouton vers les salons
      }),
      stats: z.array(z.object({ value: z.string(), label: z.string() })).length(4),
      salons: z.object({ ...titreDeBloc, intro: z.string(), teamNote: z.string() }),
      founder: z.object({
        eyebrow: z.string(),
        name: z.string(),
        photo: image(),
        photoAlt: z.string(),
        bio: z.array(z.string()).min(1), // un élément = un paragraphe
        facts: z.array(z.string()),
      }),
      newClient: z.object({ ...titreDeBloc, text: z.string(), cta: lien }),
      visit: z.object({ ...titreDeBloc, intro: z.string() }),
      instagram: z.object({ ...titreDeBloc, text: z.string() }),
      news: z.object({ ...titreDeBloc, intro: z.string() }),
      shop: z.object({ ...titreDeBloc, text: z.string(), cta: lien }),
    }),
});

export const collections = { pages, landings, salons, actus, accueil };
