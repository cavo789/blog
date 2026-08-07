# 0078 — Docker : réduire le gaspillage apt des couches de l'image de base

- **Priority**: Low
- **Batch**: docker
- **Depends**: —
- **Files**: `Dockerfile`, `compose.yaml`

## Problème

L'image `mcr.microsoft.com/devcontainers/javascript-node:20-bookworm` contribue 18 couches (0–17)
pour un total de ~1,48 Go sur les 2,5 Go de l'image finale `blog-docusaurus:development`. Ces
couches contiennent plusieurs appels `apt-get install` non fusionnés et non protégés par
`--mount=type=cache`, ce qui génère du gaspillage structurel visible dans dive :

- `/var/lib/dpkg/status` — count=7, 1,79 Mo par copie → 10,7 Mo de gaspillage cumulé
- `/var/cache/debconf/templates.dat` — count=5, 4,14 Mo par copie → 16,5 Mo gaspillés
- Bibliothèques système (libcrypto.a 18 MB, libMagickCore 5 MB, libc.a 11 MB…) — count=2 à cause
  de réinstallations entre couches de l'image de base → ~150 Mo de gaspillage estimé

Ce gaspillage est **hors de contrôle direct** depuis notre `Dockerfile` : il provient des couches
de l'image upstream.

## Risque

Purement d'espace disque ; aucun impact fonctionnel. À revisiter si la taille de l'image devient
un problème (CI, transfert réseau, stockage registry).

## Solution envisagée

Abandonner `mcr.microsoft.com/devcontainers/javascript-node:20-bookworm` comme base et passer à
`node:20-bookworm-slim`, en réinstallant manuellement les outils nécessaires (git, bash,
bash-completion, mkcert) avec `--mount=type=cache`. Gain estimé : 800 Mo–1,2 Go. Voir aussi
la proposition B1 issue du `/docker-dive-optimization` du 2026-08-07.

Ce TODO ne devient prioritaire qu'après décision sur B1 (remplacement de l'image de base).
