# Surcouche WOMEN Coiffure — ajouter une actu, un salon, une page

- **Une actu** (« ajoute une actu », « annonce le shooting ») : créer `src/content/actus/<slug>.md` sur le modèle des fichiers voisins : `title`, `date` (AAAA-MM-JJ, ou AAAA-MM pour un mois entier), `tag` (mot court : Gamme, Boutique, Événementiel, Collection, Déplacement…), `link` optionnel (`label`, `href`) ; le texte de l'actu est le corps du fichier (une ou deux phrases). Elle apparaît d'elle-même dans « Les nouvelles », triée par date. Retirer une actu = supprimer son fichier (puis `rm -rf node_modules/.astro dist` avant de vérifier).
- **Une réalisation avant/après** (« ajoute cet avant/après », « mets cette transformation en ligne ») : créer `src/content/realisations/<slug>.md` et un dossier `src/content/realisations/<slug>/` pour ses deux photos (format portrait de préférence, recadrées en 3:4 ; convertir en `.webp`). En-tête : `title` (« Blond polaire sur cheveux bruns »), `date` (AAAA-MM-JJ ou AAAA-MM), `salon` facultatif (`hyeres`, `carqueiranne` ou `la-londe-les-maures`), `before: ./<slug>/avant.webp` + `beforeAlt`, `after: ./<slug>/apres.webp` + `afterAlt` (descriptions courtes de chaque photo, obligatoires). Le texte court (une ou deux phrases) est le corps du fichier. Modèle :
  ```
  ---
  title: Blond polaire sur cheveux bruns
  date: 2026-11-05
  salon: hyeres
  before: ./blond-polaire/avant.webp
  beforeAlt: Cheveux bruns mi-longs avant la décoloration
  after: ./blond-polaire/apres.webp
  afterAlt: Blond polaire lumineux, brushing ondulé
  ---

  Trois heures de décoloration douce et une patine glacée.
  ```
  La section « Nos réalisations » de l'accueil n'apparaît qu'à partir de la première réalisation ; triées de la plus récente à la plus ancienne. Ne jamais publier de photo sans l'accord de la cliente (le demander à Nathalie s'il n'est pas dit). Retirer une réalisation = supprimer son fichier et son dossier (puis `rm -rf node_modules/.astro dist` avant de vérifier).
- **Un salon** : une fiche de plus dans `src/content/salons/` (copier une fiche existante, `order` = position), photos dans un dossier du même nom. Carte, galerie, pied de page et JSON-LD suivent seuls.
- **Une page de texte** : `src/content/pages/<slug>.md` comme le prévoit SKILL.md ; seule existe `mentions-legales.md`, liée depuis le pied de page (`legalLinks` de site.json) ; le menu ne pointe que vers les sections de l'accueil.
