---
Priority: low
Batch: maintenance
Depends: —
Files: scripts/translate-post.mjs
---

## Problème

`yarn translate blog/2026/09/28/docusaurus-ask-my-blog` (chemin de dossier, sans `index.md`) lance une erreur `EISDIR: illegal operation on a directory, read` alors que la doc CLAUDE.md garantit que les deux formes fonctionnent ("folder or index.md, both work").

Le problème est apparu après la création du dossier `images/` dans l'article. Le script résout probablement le chemin du dossier en itérant son contenu, puis tente un `readFileSync` sur `images/` au lieu de `index.md`.

## Risque

Régression silencieuse : un auteur qui utilise la forme courte (dossier) obtient une erreur cryptique au lieu de la traduction. Le workaround `index.md` explicite fonctionne.

## Solution

Dans `scripts/translate-post.mjs`, à la ligne où un chemin de dossier est résolu, filtrer les entrées pour ne retenir que les fichiers `index.md` / `index.mdx` et ignorer les sous-dossiers (`images/`, `files/`).
