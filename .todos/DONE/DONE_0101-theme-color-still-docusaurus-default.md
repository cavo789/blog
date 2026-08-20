# 0101 — La couleur d'accent du site est encore le vert par défaut de Docusaurus

- **Priority**: Low
- **Batch**: blog-branding
- **Depends**: —
- **Files**: `src/css/custom.css`

## Problème

Audit visuel du 2026-08-20 : `src/css/custom.css:22` (`--ifm-color-primary: #2e8555`) et sa
variante sombre `:36` (`#25c2a0`) sont les valeurs **exactes** du thème "classic" livré par défaut
par Docusaurus, jamais personnalisées — vérifié dans le fichier, qui les déclare pourtant comme
"source de vérité" en commentaire (donc un choix assumé de ne pas les recalculer ailleurs, mais
pas nécessairement un choix esthétique délibéré au départ).

C'est visuellement la seule pièce du site qui n'a reçu aucune identité propre, alors que tout le
reste a été soigné : mascotte récurrente, avatar personnalisé, ~150 illustrations générées sur
mesure pour les bannières d'articles. N'importe quel visiteur ayant déjà croisé un site Docusaurus
non personnalisé reconnaît cette teinte de vert immédiatement — elle ne dit rien de spécifique à
ce blog.

## Solution

Décision à prendre, pas un correctif mécanique : garder ce vert en connaissance de cause (il reste
un choix parfaitement défendable — sobre, lisible, cohérent avec les usages "doc technique"), ou
choisir une teinte d'accent propre au blog et recalculer la rampe `--ifm-color-primary*` (7 nuances
en clair + 7 en sombre) autour d'elle. Si personnalisation : vérifier le contraste de la nouvelle
teinte sur fond clair et sombre (boutons primaires, liens, badges de tag) avant de généraliser.

## Risque

- Une palette d'accent est utilisée dans toute la UI (boutons, liens, badges, TOC actif) — un
  changement mal vérifié en contraste toucherait beaucoup de surfaces d'un coup. Prévoir un
  passage visuel complet (clair + sombre) avant de merger, pas juste la page d'accueil.

## Acceptance

- [ ] Décision actée : vert par défaut conservé sciemment, ou nouvelle teinte choisie
- [ ] Si nouvelle teinte : rampe complète (7 nuances clair + 7 sombre) mise à jour dans
      `src/css/custom.css`, contraste vérifié sur boutons/liens/badges en clair et sombre
- [ ] `yarn lint && yarn format:check && yarn build` passent
