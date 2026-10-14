import { z } from 'astro/zod';

const link = z.object({ label: z.string(), href: z.string() });

// Pied de page sombre en colonnes (identité, téléphone, réservation par salon,
// Instagram) + barre fixe mobile « Prendre RDV / Appeler ». Variante de CHROME —
// rendue une fois par BaseLayout depuis SITE et la collection salons
// (src/lib/chrome.ts), jamais depuis le frontmatter d'une page.
export const schema = z.object({
  type: z.literal('nav.footer-salons'),
  organizationName: z.string(),
  logo: z.custom<ImageMetadata>(),
  tagline: z.string(),
  phone: z.object({ display: z.string(), href: z.string(), note: z.string().optional() }),
  booking: z.array(link), // un lien de réservation par salon
  instagram: z.array(link),
  legal: z.array(link), // liens de service de la ligne du bas (mentions légales)
  stickyBar: z.object({ cta: link, callLabel: z.string() }),
});

export type FooterSalonsSection = z.infer<typeof schema>;
