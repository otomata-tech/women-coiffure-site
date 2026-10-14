import { z } from 'astro/zod';

// En-tête collant : logo à gauche, navigation (masquée sur mobile), bouton de
// réservation à droite. Variante de CHROME — rendue une fois par BaseLayout
// depuis SITE (src/lib/chrome.ts), jamais depuis le frontmatter d'une page.
export const schema = z.object({
  type: z.literal('nav.header-brand'),
  brand: z.string(), // texte alternatif du logo
  logo: z.custom<ImageMetadata>(),
  nav: z.array(z.object({ label: z.string(), href: z.string() })),
  cta: z.object({ label: z.string(), href: z.string() }),
});

export type HeaderBrandSection = z.infer<typeof schema>;
