# Surcouche WOMEN Coiffure — comprendre une demande

Le site est une seule page (l'accueil). Presque tout ce que Nathalie voit vient d'un fichier de contenu (CLAUDE.md § Projet) :

| Ce qu'elle voit | Fichier | Skill |
|---|---|---|
| un salon : équipe, spécialités, adresse, horaires, notes et nombres d'avis, lien de réservation, photo, galerie | `src/content/salons/<hyeres / carqueiranne / la-londe-les-maures>.md` | `editer-page` (texte), `gerer-images` (photos) |
| une actualité (« Les nouvelles ») | `src/content/actus/<slug>.md` | `editer-page` ; en ajouter une : `creer-page` |
| titre du haut, chiffres clés, bio de Nathalie, nouvelle cliente, mariages & événements, bandeau Instagram, boutique, en-têtes de section | `src/content/accueil/accueil.md` | `editer-page` |
| téléphone, menu, bouton « Prendre RDV », comptes Instagram, phrase du pied de page | `src/content/settings/site.json` | `editer-global` |
| logo, apparence, mise en page | `src/lib/site.ts`, `src/components/` | `gerer-images` (logo) / `modifier-design` |

Pas de blog sur ce site : « publie un article / une nouvelle » = une actu (`creer-page`).
