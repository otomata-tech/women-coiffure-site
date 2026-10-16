# ADR 0003 — Hébergement Cloudflare Pages, mise en ligne par la CI

## Statut
Accepté (2026-10-16). Remplace l'ADR 0002 (Scaleway, jamais mis en place).

## Contexte
Le site est servi depuis le 14/10/2026 par le projet Cloudflare Pages `women-coiffure` du compte Otomata (démo `women-coiffure.oto.zone`, puis `www.women-coiffure.fr`). Le DNS de `women-coiffure.fr` est délégué à Cloudflare par sa titulaire (Nathalie Laporte, WOMEN CONCEPT, domaine acheté chez OVH). Les publications passaient par un script local.

## Décision
- Hébergement : Cloudflare Pages, projet `women-coiffure`. Domaines : `www.women-coiffure.fr` (principal), `women-coiffure.fr` (redirection 301 vers www, règle de redirection de la zone), `women-coiffure.oto.zone` (ancienne démo).
- Mise en ligne : un push sur `main` déclenche `.github/workflows/ci.yml` — lint et build, puis job `deploy` (`wrangler pages deploy`). Secrets du dépôt : `CLOUDFLARE_API_TOKEN` (jeton limité à « Pages Write » sur le compte), `CLOUDFLARE_ACCOUNT_ID`.
- En-têtes : `public/_headers` (cache long sur `/_astro/*`). Site ouvert à l’indexation le 16/10/2026.

## Conséquences
+ Publier = pousser sur `main` ; plus de script local ni de jeton manipulé à la main.
+ Compression, https et HTTP/2-3 fournis par Cloudflare.
- Un push cassé ne part pas (le build échoue avant le déploiement), mais un push valide part en ligne sans relecture humaine : la confirmation se fait avant le push (skill `publier`).
- La négociation `Accept: text/markdown` n'existe pas : seul le chemin `.md` fonctionne (llms.txt ne promet que lui).
