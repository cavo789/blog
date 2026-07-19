# 052 — Explications dupliquées d'un article à l'autre au lieu d'un renvoi

**Priority:** Low

## Problème

Plusieurs explications techniques sont réécrites quasi mot pour mot dans plusieurs articles au
lieu d'être expliquées une seule fois puis liées via `<Link>`, alors que le blog a déjà cette
convention ailleurs (ex. `docusaurus-go-top` renvoie vers un article précédent au lieu de tout
réexpliquer).

**UID/GID Docker (`user: ${UID:-1000}:${GID:-1000}`)** — réexpliqué en détail dans 4 articles :

- `blog/2025/07/18/docker-karakeep/index.md`
- `blog/2025/07/29/docker-memos/index.md` (quasi identique au précédent, mot pour mot)
- `blog/2025/10/13/docker-prod-devcontainer/index.md` (lignes ~287-289)
- `blog/2025/11/11/running-docusaurus-using-docker/index.md` (AlertBox danger, lignes ~152-154)

**Boilerplate "swizzle / redémarrer Docusaurus"** dans la série _Creating Docusaurus components_ —
réexpliqué dans 2 articles, correctement lié dans un 3e :

- `blog/2025/09/03/docusaurus-relatedposts/index.md` — explique en entier les étapes de swizzle
- `blog/2025/09/09/docusaurus-series/index.md` — répète le même paragraphe de swizzle **deux fois
  dans le même article**, plus le même helper `posts.js` déjà expliqué dans `relatedposts`
- `blog/2025/09/12/docusaurus-go-top/index.md` — fait ça bien : renvoie vers l'article précédent
  au lieu de tout réexpliquer

**Paragraphe dupliqué avant/après `<!-- truncate -->`** (pas le hook intentionnel, la même phrase
répétée deux fois) :

- `blog/2025/04/11/docker-oracle-ords/index.md` (lignes ~25-26 et ~35-36)
- `blog/2025/04/18/oracle-dotnet-nodejs-php-python/index.md` (même pattern)

## Risque

Maintenance en plusieurs endroits : si l'explication UID/GID doit être corrigée ou affinée un jour,
il faut le faire dans 4 articles au lieu d'un seul canonique. Pour le lecteur, ça n'apporte rien de
mal en soi, mais ça alourdit inutilement des articles déjà denses.

## Solution proposée

- Choisir un article canonique pour l'explication UID/GID (le plus complet, probablement
  `docker-prod-devcontainer` ou le premier chronologiquement, `docker-karakeep`) et remplacer les
  répétitions par un `<AlertBox>` court + `<Link>` vers cet article.
- Dans `docusaurus-series`, remplacer la ré-explication du helper `posts.js` et du swizzle par un
  renvoi vers `docusaurus-relatedposts`, sur le modèle de ce que fait déjà `docusaurus-go-top`.
- Supprimer la phrase dupliquée autour de `<!-- truncate -->` dans `docker-oracle-ords` et
  `oracle-dotnet-nodejs-php-python` (garder une seule occurrence, reformulée si besoin pour le hook
  d'intro).

## Lien avec l'existant

Aucun TODO existant. Trouvé lors du même audit `blog/2025` que [[049]], [[050]], [[051]].
