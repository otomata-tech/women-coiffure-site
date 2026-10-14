# ADR 0002 — Hébergement statique Scaleway, retrait de vercel.json

## Statut
Accepté (2026-10-14).

## Contexte
Le socle cible Vercel : `vercel.json` porte la négociation `Accept: text/markdown`, les alias 308 /about et /privacy et le `Vary: Accept`. WOMEN Coiffure sera servi en statique chez Scaleway ; les pages visées par les alias ont été retirées.

## Décision
`vercel.json` supprimé (aucun build ni script ne le lit). Le `dist/` est publié tel quel sur un hébergement statique Scaleway. Domaine définitif non choisi : `site` provisoire `https://women-coiffure.oto.zone`.

## Conséquences
+ Une seule config d'hébergement à écrire, côté Scaleway.
- La négociation `Accept: text/markdown` n'existe pas tant que l'hébergeur ne la porte pas : seul le chemin `.md` fonctionne (llms.txt ne promet que lui).
- À régler côté Scaleway au déploiement : page 404 réelle (statut 404), cache long sur `/_astro/*`, compression, https. Rien n'est déployé à ce jour.
