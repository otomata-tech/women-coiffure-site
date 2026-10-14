import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import { dateSortKey } from '@/lib/actus';

export type Realisation = CollectionEntry<'realisations'>;

/** Réalisations de la plus récente à la plus ancienne, avec le nom du salon. */
export async function getRealisations(): Promise<{ entry: Realisation; salonName?: string }[]> {
  const entries = (await getCollection('realisations')).sort(
    (a, b) =>
      dateSortKey(b.data.date).localeCompare(dateSortKey(a.data.date)) || a.id.localeCompare(b.id),
  );
  return Promise.all(
    entries.map(async (entry) => ({
      entry,
      salonName: entry.data.salon ? (await getEntry(entry.data.salon))?.data.name : undefined,
    })),
  );
}
