// Numéro de téléphone : saisi une fois au format international E.164
// (+33494912713, site.json), décliné ici pour l'affichage et le lien tel:.

/** +33494912713 → « 04 94 91 27 13 ». Un numéro non français casse le build. */
export function formatPhoneFr(e164: string): string {
  const m = e164.match(/^\+33([1-9])(\d{8})$/);
  if (!m) throw new Error(`Téléphone « ${e164} » : format +33XXXXXXXXX attendu.`);
  const national = `0${m[1]}${m[2]}`;
  return national.replace(/(\d{2})(?=\d)/g, '$1 ');
}

export function telHref(e164: string): string {
  return `tel:${e164}`;
}
