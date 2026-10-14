# Surcouche WOMEN Coiffure — éditer un texte

Prime sur SKILL.md § Traduire la demande : l'accueil n'a pas de texte en dur, il assemble trois sources.
- **Salon** (« change les horaires de Carqueiranne », « ajoute Julie à l'équipe de Hyères », « mets à jour les avis ») → `src/content/salons/<salon>.md`.
  - Horaires : champ `openingHours`, une plage par ligne (`days`, `opens`, `closes` au format 09:00). Le texte affiché est calculé : ne jamais l'écrire. Fermeture exceptionnelle ou horaires différents certains jours = plusieurs plages ; un besoin que les plages n'expriment pas (« fermé du 1er au 15 août ») : développement, le dire.
  - Avis : `reviews.google` / `reviews.planity`, `rating` (note, ex. 4.9) et `count` (nombre d'avis). Les chiffres « près de 500 avis Google » du haut de page sont dans `accueil.md` (`stats`) : proposer de les mettre à jour aussi.
  - Une adresse change aussi le lien Maps (`mapsUrl`) : le signaler.
- **Actu existante** → `src/content/actus/<slug>.md` : titre et `tag` dans l'en-tête, texte dans le corps.
- **Autres textes de l'accueil** → `src/content/accueil/accueil.md`, puis bumper `updatedDate`. La bio de Nathalie (`founder.bio`) est son texte : un tiret = un paragraphe, le premier s'affiche en chapeau, `- quote: "…"` met une phrase en citation. Typographie française (apostrophe ’, espace insécable avant « : »), sans réécrire.
- Téléphone, menu, Instagram → `editer-global`.
