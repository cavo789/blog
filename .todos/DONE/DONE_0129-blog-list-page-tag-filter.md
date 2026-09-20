# 0129 — Filtre par tag interactif sur /blog/

- **Priority**: Medium
- **Batch**: blog-list-filter
- **Depends**: —
- **Files**: `src/theme/BlogListPage/index.js`, `src/theme/BlogListPage/styles.module.css`, `src/components/Blog/utils/tagsI18n.ts`, `blog/tags.yml`, `package.json`

## Problème

`/blog/` (257 posts) n'offre que la pagination classique. Pour filtrer par tag, le lecteur doit
déjà connaître l'existence des pages `/blog/tags/<slug>` — rien sur la page liste elle-même ne les
suggère. Avec 49 tags définis dans `blog/tags.yml`, c'est un vrai coût de découverte sur le point
d'entrée le plus visité après la home.

## Solution proposée

Une rangée de "pills" sous le header (`All posts <count>`), inspirée de la maquette fournie par
l'auteur :

- Pill "all" (état par défaut) + les **10 `mainTag` les plus fréquents** du corpus visible dans la
  locale rendue (`allPosts` via `useBlogMetadata()` — translated-only sur `fr`, donc jamais de
  pill pointant vers un tag sans article traduit), calculés dynamiquement (pas une liste
  éditoriale figée — comptage automatique, reste correct sans maintenance quand le corpus évolue),
  ainsi qu'un lien "all tags →" vers `/blog/tags` pour le reste. Mesuré le 2026-09-19 sur `en` :
  `docker 22, linux 17, docusaurus 17, component 15, vscode 13, bash 12, ai 12, quarto 11,
  self-hosted 9, php 9`.
- **Filtre réellement interactif** (pas des `<Link>` vers `/blog/tags/<slug>`) : cliquer une pill
  filtre la grille affichée sans rechargement de page. Ce n'est PAS une réimplémentation de la
  page tags — juste un raccourci de tri sur la liste déjà chargée.
- **Animation** : `@formkit/auto-animate` (nouvelle dépendance, ~2 kB, zéro config — un hook sur le
  conteneur `.cardsGrid`) pour que les cartes glissent vers leur nouvelle position quand le filtre
  change, plutôt qu'un simple pop-in/pop-out. Écarté : Isotope (metafizzy) — abandonné depuis 6 ans
  et de toute façon mal adapté ici, puisqu'il manipule le DOM lui-même (héritage jQuery) et se bat
  avec le reconciliation de React, avec des soucis en SSR sous Docusaurus.
- Le filtrage doit composer avec la pagination déjà réécrite à la main dans
  `BlogListPageContent` (voir les commentaires lignes 71-140 du fichier) : `localePosts`,
  `pagePosts`, `paginatorMetadata` sont recalculés pour gérer le fallback i18n. Filtrer côté
  client doit soit re-paginer sur le sous-ensemble filtré, soit passer en "liste plate sans
  pagination" quand un filtre est actif — à trancher à l'implémentation, mais dans tous les cas
  sans casser le rendu par défaut (`en`) ni le fallback `fr`.
- `.claude/rules/i18n-locale-safety.md` s'applique : ce fichier est sous `src/theme/**`. Les
  labels de tags affichés doivent passer par `tagsI18n.ts` (déjà le localizer partagé pour les
  tags), pas par un nouveau chemin ad hoc.

## Risque

- Le filtrage doit rester utilisable au clavier/lecteur d'écran (pills = boutons, pas juste des
  `<div onClick>`).
- Éviter de dupliquer la logique de comptage/tri des tags si elle existe déjà ailleurs (vérifier
  `tagsI18n.ts` et les usages de `mainTag` dans `Blog/utils/posts.ts` avant d'écrire un nouveau
  calcul).
