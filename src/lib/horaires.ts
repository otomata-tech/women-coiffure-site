import type { CollectionEntry } from 'astro:content';

// Horaires d'un salon : saisis une fois en plages structurées (fiche salon,
// champ openingHours), déclinés ici en texte affiché ET en JSON-LD. Le texte
// n'est jamais saisi à la main : il ne peut pas diverger des données Google.

type OpeningHours = CollectionEntry<'salons'>['data']['openingHours'];
type Day = OpeningHours[number]['days'][number];

const WEEK: Day[] = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

const SCHEMA_DAY: Record<Day, string> = {
  lundi: 'Monday',
  mardi: 'Tuesday',
  mercredi: 'Wednesday',
  jeudi: 'Thursday',
  vendredi: 'Friday',
  samedi: 'Saturday',
  dimanche: 'Sunday',
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** « 09:00 » → « 9h », « 18:30 » → « 18h30 ». */
function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(':');
  return `${Number(h)}h${m === '00' ? '' : m}`;
}

const sortDays = (days: Day[]) =>
  [...new Set(days)].sort((a, b) => WEEK.indexOf(a) - WEEK.indexOf(b));

/** Jours consécutifs → « Du lundi au samedi » ; sinon énumération. */
function formatDays(days: Day[]): string {
  const sorted = sortDays(days);
  const first = WEEK.indexOf(sorted[0]);
  const consecutive = sorted.every((d, i) => WEEK.indexOf(d) === first + i);
  if (sorted.length === 1) return capitalize(sorted[0]);
  if (consecutive && sorted.length > 2) return `Du ${sorted[0]} au ${sorted.at(-1)}`;
  if (sorted.length === 2) return `${capitalize(sorted[0])} et ${sorted[1]}`;
  return capitalize(sorted.join(', '));
}

/**
 * Texte affiché : « Du lundi au samedi, 9h–18h », ou
 * « Lundi, mardi, jeudi, vendredi, samedi, 9h–18h · fermé le mercredi » quand
 * un jour de fermeture tombe entre deux jours d'ouverture.
 */
export function formatOpeningHours(hours: OpeningHours): string {
  const slots = hours.map(
    (h) => `${formatDays(h.days)}, ${formatTime(h.opens)}–${formatTime(h.closes)}`,
  );
  const open = sortDays(hours.flatMap((h) => h.days));
  const from = WEEK.indexOf(open[0]);
  const to = WEEK.indexOf(open.at(-1)!);
  const closed = WEEK.slice(from, to + 1).filter((d) => !open.includes(d));
  if (closed.length) slots.push(`fermé le ${closed.join(' et le ')}`);
  return slots.join(' · ');
}

/** Plages schema.org (OpeningHoursSpecification) pour le nœud HairSalon. */
export function openingHoursJsonLd(hours: OpeningHours) {
  return hours.map((h) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: sortDays(h.days).map((d) => SCHEMA_DAY[d]),
    opens: h.opens,
    closes: h.closes,
  }));
}
