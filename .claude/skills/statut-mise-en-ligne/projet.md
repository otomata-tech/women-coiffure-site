# Surcouche WOMEN Coiffure — statut de mise en ligne

Hébergeur alimenté par la CI (ADR 0003) : le job `deploy` du workflow CI EST la mise en ligne.
- Point 2 : `gh run list --branch main --limit 3 --json headSha,status,conclusion,createdAt,name` ; le run du dernier commit d'`origin/main` doit être `completed` / `success`. En échec : `gh run view <id> --log-failed`, et dire si c'est le build (le site n'a pas été publié) ou le déploiement.
- Point 3 : adresse publique `https://www.women-coiffure.fr` + chemin. Le cache Cloudflare peut retarder l'affichage d'une minute.
