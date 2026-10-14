# Surcouche WOMEN Coiffure — ajouter une actu, un salon, une page

- **Une actu** (« ajoute une actu », « annonce le shooting ») : créer `src/content/actus/<slug>.md` sur le modèle des fichiers voisins : `title`, `date` (AAAA-MM-JJ, ou AAAA-MM pour un mois entier), `tag` (mot court : Gamme, Boutique, Événementiel, Collection, Déplacement…), `link` optionnel (`label`, `href`) ; le texte de l'actu est le corps du fichier (une ou deux phrases). Elle apparaît d'elle-même dans « Les nouvelles », triée par date. Retirer une actu = supprimer son fichier (puis `rm -rf node_modules/.astro dist` avant de vérifier).
- **Un salon** : une fiche de plus dans `src/content/salons/` (copier une fiche existante, `order` = position), photos dans un dossier du même nom. Carte, galerie, pied de page et JSON-LD suivent seuls.
- **Une page de texte** (mentions légales…) : `src/content/pages/<slug>.md` comme le prévoit SKILL.md ; aucune page n'existe aujourd'hui et le menu ne pointe que vers l'accueil.
