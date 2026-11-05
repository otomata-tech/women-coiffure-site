# ADR 0004 — Quiz /quiz/ : relais Pages Function vers oto

## Statut
Accepté (2026-11-05, décision d'Alexis). Première exception à « tout est statique » (ADR 0001) : le site gagne une surface serveur, limitée à ce relais. Le relais du dépôt à part `quiz-trichologie` (son ADR 0001) est repris ici, adapté au domaine du salon.

## Contexte
Nathalie a mis en ligne elle-même son quiz Qualiopi de trichologie (V3) sur `https://www.women-coiffure.fr/quiz/`, adresse de son QR code (formation Artemoda chez DAVINES Paris, 9 et 10/11/2026). Sans relais (`ENDPOINT` vide), chaque évaluation partait par un e-mail pré-rempli que la stagiaire devait envoyer. Les réponses doivent aller dans le tableau oto `qualiopi-trichologie` (ns 948, org 307 « women.distrib »), une ligne par stagiaire, clé `id_stagiaire`. Un jeton oto à droit `write` ne peut pas vivre dans la page (lecture et suppression des lignes, pas de CORS, pas d'anti-abus).

## Décision
- La page reste `public/quiz/index.html`, celle de Nathalie, retouchée au minimum : `ENDPOINT="/api/quiz"`, `id_stagiaire` en UUID v4 (`crypto.randomUUID()`, gardé dans le `localStorage` ; la V3 le formait de session + nom + prénom, devinable), une phrase d'information sur les données. Son repli e-mail reste : il s'affiche dès que l'envoi au relais échoue.
- La page poste deux fois à `/api/quiz` (Pages Function `functions/api/quiz.js`) : au début, puis à la fin avec la satisfaction. Le relais n'accepte que POST JSON de même origine (`www.women-coiffure.fr` ou une prévisualisation `*.women-coiffure.pages.dev`), plafonne le corps à 16 Ko, reconnaît l'étape, exige chacun de ses champs et refuse tout autre, borne chaque valeur. Les champs admis sont exactement les 25 colonnes de la table 948.
- Il écrit `POST https://mcp.oto.cx/api/datastores/948/rows?key=id_stagiaire` : la ligne est créée au premier envoi, complétée au second ; une cellule vide n'est pas envoyée. Jeton : secret Pages `OTO_QUIZ_TOKEN` (portée `{"namespaces":{"948":"write"}}`). Le navigateur ne reçoit que `{ok:true}` ou une erreur générique.
- La CI publie `functions/` avec `dist/` : l'artefact du job build porte les deux, restitués à la racine, où `wrangler pages deploy dist` compile `functions/`.

## Conséquences
+ Aucun secret côté client ; le jeton n'écrit que ce tableau, et une ligne n'est désignée que par un UUID qu'on ne devine pas.
+ Sans secret (pas encore créé, ou expiré), le relais répond 503 et la page bascule sur l'e-mail : rien ne casse.
- La page et le relais partagent `SESSION`, les seuils de niveau et les valeurs des objectifs : une nouvelle version de Nathalie se reporte dans le relais.
- Début et fin se relient par le téléphone : une fin faite sur un autre téléphone crée une seconde ligne.
- Le jeton expire (90 jours au plus) : à renouveler.
- Un changement de `functions/` se teste avec `wrangler pages dev` (faux jeton, oto simulé via `OTO_API_BASE`, origine locale via `QUIZ_DEV_ORIGIN`).
