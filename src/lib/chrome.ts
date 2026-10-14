import { getCollection } from 'astro:content';
import { SITE } from '@/lib/site';
import type { HeaderBrandSection } from '@/components/sections/nav/HeaderBrand.schema';
import type { FooterSalonsSection } from '@/components/sections/nav/FooterSalons.schema';

// Chrome du site : header et footer sont des VARIANTES de section (famille nav),
// rendues une seule fois par BaseLayout. Ce fichier est le seul endroit qui
// traduit le texte global (SITE ← site.json, collection salons) vers la forme
// attendue par la variante choisie. Changer de variante = changer l'import + le
// type dans BaseLayout, et adapter l'objet ci-dessous au schéma de la nouvelle
// variante.

export const SITE_HEADER: HeaderBrandSection = {
  type: 'nav.header-brand',
  brand: SITE.name,
  logo: SITE.logo.onLight,
  nav: [...SITE.nav],
  cta: SITE.bookingCta,
};

export async function getSiteFooter(): Promise<FooterSalonsSection> {
  if (!SITE.phone) throw new Error('site.json : contact.phone est requis (pied de page, barre mobile).');
  const salons = (await getCollection('salons')).sort((a, b) => a.data.order - b.data.order);
  return {
    type: 'nav.footer-salons',
    organizationName: SITE.organization.name,
    logo: SITE.logo.onDark,
    tagline: SITE.tagline,
    phone: { ...SITE.phone, note: SITE.contact?.phoneNote },
    booking: salons.map((s) => ({ label: s.data.name, href: s.data.bookingUrl })),
    instagram: SITE.social.instagram.map((a) => ({ label: a.handle, href: a.url })),
    stickyBar: { cta: SITE.bookingCta, callLabel: SITE.callLabel },
  };
}
