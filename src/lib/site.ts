import { z } from 'astro/zod';
import settings from '@/content/settings/site.json';
import { formatPhoneFr, telHref } from '@/lib/phone';
// Logo affiché (en-tête : noir ; pied de page : blanc) : référencé ICI SEUL,
// les composants le reçoivent par src/lib/chrome.ts. Changer de logo = remplacer
// ces fichiers (et public/logo.svg, sa copie pour le JSON-LD).
import logoDark from '@/assets/logo-noir.svg';
import logoLight from '@/assets/logo-blanc.svg';

// --- Validation du texte global (règle absolue 4 : tout contenu passe par Zod) --
// site.json est parsé au build : un champ manquant ou mal typé casse le build.
const settingsSchema = z.object({
  name: z.string().min(1),
  shortName: z.string().min(1),
  description: z.string().min(1),
  // Optionnel : 1 à 3 phrases disant pour quels besoins/questions ce site est
  // la bonne source (exposé dans llms.txt pour les agents).
  whenToUse: z.string().optional(),
  // Phrase d'identité du pied de page.
  tagline: z.string().min(1),
  nav: z.array(z.object({ label: z.string().min(1), href: z.string().min(1) })),
  // Liens de service du bas du pied de page (mentions légales).
  legalLinks: z.array(z.object({ label: z.string().min(1), href: z.string().min(1) })),
  // Bouton « Prendre RDV » de l'en-tête et de la barre fixe mobile.
  bookingCta: z.object({ label: z.string().min(1), href: z.string().min(1) }),
  // Libellé du bouton d'appel de la barre fixe mobile.
  callLabel: z.string().min(1),
  organizationName: z.string().min(1),
  // Fondateur (JSON-LD Organization.founder, nœud Person).
  founder: z.object({
    name: z.string().min(1),
    jobTitle: z.string().min(1),
    description: z.string().min(1),
  }),
  // Coordonnées publiques, optionnelles : un site sans elles build toujours.
  // Rendues en JSON-LD Organization (contactPoint) et sur la page contact.
  contact: z
    .object({
      email: z.string().email().optional(),
      phone: z.string().optional(), // format international E.164 recommandé : +33…
      // Phrase qui accompagne le numéro (pied de page, bloc des salons).
      phoneNote: z.string().optional(),
      contactType: z.string().default('customer service'), // valeur schema.org
    })
    .optional(),
  // Adresse postale publique, optionnelle. NAP (nom, adresse, téléphone) à tenir
  // identique ici et dans les annuaires : c'est ce que recoupent les scanners.
  address: z
    .object({
      streetAddress: z.string().optional(),
      postalCode: z.string().optional(),
      addressLocality: z.string(),
      addressRegion: z.string().optional(),
      addressCountry: z.string(), // code ISO 3166-1 alpha-2 : FR
    })
    .optional(),
  social: z.object({
    twitter: z.string(),
    linkedin: z.string(),
    // Comptes Instagram, le principal en premier (bandeau, pied de page, sameAs).
    instagram: z.array(z.object({ handle: z.string().min(1), url: z.string().url() })),
  }),
  faq: z.array(z.object({ q: z.string(), a: z.string() })),
});
const SETTINGS = settingsSchema.parse(settings);

// --- Configuration TECHNIQUE (éditée par un dev) -----------------------------
// Locale, chemins d'assets, identité JSON-LD.
const TECHNICAL = {
  // Source unique de l'URL de prod : `site` dans astro.config.mjs,
  // exposé par Astro via import.meta.env.SITE (canonical, sitemap, robots,
  // llms.txt et RSS en dérivent tous).
  url: (import.meta.env.SITE ?? 'http://localhost:4321').replace(/\/$/, ''),
  locale: 'fr-FR',
  lang: 'fr',
  // Image OG par défaut (dans /public). Override possible par page via seo.ogImage.
  defaultOgImage: '/og-default.jpg',
  // Couleur de la barre du navigateur mobile (= --color-inverse, global.css).
  themeColor: '#0B0A09',
  organization: {
    logo: '/logo.svg',
  },
};

// Téléphone décliné une fois pour toutes (affichage + lien tel:) ; absent de
// site.json = aucun bouton d'appel rendu.
const phone = SETTINGS.contact?.phone
  ? { display: formatPhoneFr(SETTINGS.contact.phone), href: telHref(SETTINGS.contact.phone) }
  : undefined;

// --- Configuration ÉDITORIALE (src/content/settings/site.json) ---------------
// Textes globaux partagés, édités directement dans ce fichier JSON :
// nom, description, navigation, organisation, réseaux, FAQ globale partagée.
export const SITE = {
  name: SETTINGS.name,
  shortName: SETTINGS.shortName,
  url: TECHNICAL.url,
  description: SETTINGS.description,
  // Cas d'usage concrets du site (GEO/agentic) : rendu dans llms.txt si renseigné.
  whenToUse: SETTINGS.whenToUse,
  locale: TECHNICAL.locale,
  lang: TECHNICAL.lang,
  defaultOgImage: TECHNICAL.defaultOgImage,
  themeColor: TECHNICAL.themeColor,
  logo: { onLight: logoDark, onDark: logoLight },
  tagline: SETTINGS.tagline,
  legalLinks: SETTINGS.legalLinks,
  bookingCta: SETTINGS.bookingCta,
  callLabel: SETTINGS.callLabel,
  phone,
  social: {
    twitter: SETTINGS.social.twitter,
    linkedin: SETTINGS.social.linkedin,
    instagram: SETTINGS.social.instagram,
  },
  // Bloc Organization pour le JSON-LD (E-E-A-T).
  organization: {
    name: SETTINGS.organizationName,
    logo: TECHNICAL.organization.logo,
    founder: SETTINGS.founder,
    // Profils officiels de l'organisation : les comptes Instagram de site.json.
    sameAs: SETTINGS.social.instagram.map((account) => account.url),
  },
  // Coordonnées publiques (optionnelles) : alimentent le contactPoint et
  // l'address du nœud Organization (JSON-LD) et le bloc de la page contact.
  // Les scanners agentiques y lisent la légitimité de l'éditeur ; garder ce NAP
  // identique à celui publié dans les annuaires.
  contact: SETTINGS.contact,
  address: SETTINGS.address,
  // Navigation principale (header).
  nav: SETTINGS.nav,
  // FAQ globale partagée (affichable sur plusieurs pages via GlobalFaq.astro).
  faq: SETTINGS.faq,
} as const;
