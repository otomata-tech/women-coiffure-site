import { getCollection, type CollectionEntry } from 'astro:content';

export type Actu = CollectionEntry<'actus'>;
type ActuDate = Actu['data']['date'];

// Une actu datée d'un mois seul (« Octobre 2026 ») couvre le mois entier : elle
// passe avant les actus datées d'un jour du même mois. À date égale, ordre
// alphabétique du nom de fichier.
const sortKey = (d: ActuDate) => (d.precision === 'month' ? `${d.iso}-99` : d.iso);

/** Actus de la plus récente à la plus ancienne. */
export async function getActus(): Promise<Actu[]> {
  return (await getCollection('actus')).sort(
    (a, b) =>
      sortKey(b.data.date).localeCompare(sortKey(a.data.date)) || a.id.localeCompare(b.id),
  );
}

const dayFmt = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const monthFmt = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric', timeZone: 'UTC' });

/** « 5 octobre 2026 », ou « Octobre 2026 » pour une actu datée d'un mois. */
export function formatActuDate(d: ActuDate): string {
  if (d.precision === 'day') return dayFmt.format(new Date(`${d.iso}T00:00:00Z`));
  const label = monthFmt.format(new Date(`${d.iso}-01T00:00:00Z`));
  return label.charAt(0).toUpperCase() + label.slice(1);
}
