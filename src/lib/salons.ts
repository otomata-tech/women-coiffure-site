import { getCollection, type CollectionEntry } from 'astro:content';
import { getImage } from 'astro:assets';
import { SITE } from '@/lib/site';
import { openingHoursJsonLd } from '@/lib/horaires';

export type Salon = CollectionEntry<'salons'>;

/** Salons dans l'ordre d'affichage (champ `order` des fiches). */
export async function getSalons(): Promise<Salon[]> {
  return (await getCollection('salons')).sort((a, b) => a.data.order - b.data.order);
}

/** Note d'avis à la française : 5 → « 5,0 », 4.9 → « 4,9 ». */
export const formatRating = (rating: number) =>
  rating.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** Adresse sur une ligne : « 4 rue du Soldat Bellon Antoine, 83400 Hyères ». */
export const formatAddress = ({ address }: Salon['data']) =>
  `${address.streetAddress}, ${address.postalCode} ${address.addressLocality}`;

/** Nœud HairSalon du JSON-LD, rattaché à l'Organization (JsonLd.astro). */
export async function salonJsonLd(salon: Salon): Promise<Record<string, unknown>> {
  const { data } = salon;
  const image = await getImage({ src: data.photo });
  return {
    '@type': 'HairSalon',
    name: `${SITE.name} ${data.name}`,
    parentOrganization: { '@id': `${SITE.url}#organization` },
    image: new URL(image.src, SITE.url).href,
    ...(SITE.contact?.phone ? { telephone: SITE.contact.phone } : {}),
    address: {
      '@type': 'PostalAddress',
      streetAddress: data.address.streetAddress,
      postalCode: data.address.postalCode,
      addressLocality: data.address.addressLocality,
      addressCountry: 'FR',
    },
    openingHoursSpecification: openingHoursJsonLd(data.openingHours),
    url: data.bookingUrl,
  };
}
