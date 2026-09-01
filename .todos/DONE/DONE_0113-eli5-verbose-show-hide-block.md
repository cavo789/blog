# 0113 — ELI5 : bloc « Show/Hide » d'explication verbeuse, en complément du tooltip ligne par ligne

- **Priority**: Medium
- **Batch**: eli5-verbose
- **Depends**: —
- **Files**: `scripts/generate-eli5.mjs`, `scripts/bulk-eli5.mjs`, `plugins/remark-snippet-loader/index.cjs`,
  `src/components/Snippet/index.tsx`, `src/components/Snippet/styles.module.css`,
  `src/components/Details/index.tsx` (référence de pattern, pas forcément modifié)

## Contexte

Inspiration : le bouton « Expliquer le code » vu sur datacamp.com (capture fournie par l'auteur,
2026-09-01) — sous un snippet, un bouton toggle affiche/masque un bloc gris clair avec une
explication rédigée en vraies phrases (liste numérotée par instruction significative + un
paragraphe de synthèse), au lieu de badges à survoler un par un.

## Problème

Le tooltip ELI5 actuel (`Eli5CodeBlock` dans `Snippet/index.tsx`) fonctionne bien au survol sur
desktop, mais reste fragmenté : chaque badge `?` n'explique qu'une ligne isolée, et sur mobile il
n'y a pas de hover — il faut taper chaque badge un par un sur une cible tactile petite, ce qui est
pénible pour un lecteur qui veut juste comprendre l'ensemble du snippet.

## Ce qu'on garde

Le tooltip ligne par ligne reste inchangé (badges `?`, portail `createPortal`, positionnement au
survol) — pertinent et rapide d'accès sur desktop, aucune régression souhaitée dessus.

## Proposition

Ajouter, sous le bloc de code (dans `Snippet`), un bloc « Show/Hide » fermé par défaut, contenant
une explication verbeuse de l'ensemble du snippet — pas ligne par ligne, mais en prose.

Deux décisions à trancher **avant** d'écrire du code :

1. **Origine du texte** :
   - Option A — assembler le bloc à partir de la map `explanations` déjà générée (liste
     numérotée), zéro appel API supplémentaire, mais reste un style « fragment par fragment ».
   - Option B (recommandée) — étendre le prompt Claude existant dans `generate-eli5.mjs` /
     `bulk-eli5.mjs` pour demander, dans le **même appel**, un champ `summary` additionnel
     (quelques phrases de synthèse en prose) en plus de la map `explanations`. Coût marginal
     quasi nul (même requête), résultat plus naturel à lire.
2. **Pattern d'UI** : réutiliser le `<details>/<summary>` natif de `Details`
   (`src/components/Details/index.tsx`) pour la simplicité et la cohérence sémantique, plutôt que
   de dupliquer l'état/l'animation maison que `Snippet` gère déjà pour son propre chevron
   d'ouverture. Éviter en revanche de toucher au rendu interne de `Eli5CodeBlock` lui-même (voir
   Risque ci-dessous).

## Changement de schéma

- `<source>.eli5.json` gagne un champ optionnel `summary: string`, à côté de `explanations`.
  Rétrocompatible : un sidecar existant sans ce champ ne doit pas faire planter le bloc — il reste
  simplement absent (même logique de dégradation douce que le cas `LEGACY` déjà géré par
  `check-eli5-freshness.mjs` pour les fichiers sans `sourceHash`).
- `plugins/remark-snippet-loader/index.cjs` doit injecter ce nouveau champ comme prop
  supplémentaire sur `<Snippet>` (aujourd'hui seul `eli5json` — la map — est injecté).
- `generate-eli5.mjs` et `bulk-eli5.mjs` dupliquent aujourd'hui la même logique de génération
  (bulk n'importe pas le générateur unitaire) — le prompt étendu doit être répliqué aux deux
  endroits, ou l'occasion peut être prise pour factoriser (hors scope strict, à évaluer).

## Risque

- `Eli5CodeBlock` (dans `Snippet/index.tsx`) est au cœur d'un bug d'hydratation React encore
  ouvert (`.todos/0112-eli5-codeblock-hydration-mismatch.md`). Le nouveau bloc Show/Hide doit
  rester un composant bien séparé de `Eli5CodeBlock`, pour ne pas ajouter de surface à un rendu
  déjà instable et ne pas complexifier la bissection en cours sur 0112.
- Mettre à jour les ~30 fichiers `.eli5.json` existants avec le nouveau champ `summary` implique
  un `yarn eli5:bulk --force` sur tout le corpus (appels API en nombre, gros diff Git d'un coup) —
  à faire seulement après validation visuelle sur un article pilote, pas en une seule passe.
- Calibrer la verbosité cible avant d'écrire le prompt (le modèle datacamp mélange liste numérotée
  + paragraphe de conclusion) pour éviter une génération trop longue ou trop répétitive par
  rapport aux badges `?` déjà présents juste au-dessus.

## Acceptance

- [ ] Décision documentée : Option A (assemblée depuis `explanations`) vs Option B (champ `summary`
      dédié généré par le LLM)
- [ ] Décision documentée : réutilisation de `Details` vs pattern d'animation propre à `Snippet`
- [ ] Schéma `.eli5.json` mis à jour, rétrocompatibilité vérifiée (sidecar existant sans `summary`
      → bloc Show/Hide simplement absent, pas d'erreur de build ni de rendu)
- [ ] Prompt étendu dans `generate-eli5.mjs` **et** `bulk-eli5.mjs`
- [ ] Un article pilote validé visuellement (desktop + mobile) avant tout `yarn eli5:bulk --force`
      sur le reste du corpus
- [ ] `yarn lint && yarn format:check && yarn build` passent
- [ ] Aucune régression visuelle ni fonctionnelle sur le tooltip ligne par ligne existant

## Lien avec l'existant

- Design d'origine du tooltip : `.todos/DONE/DONE_004-c5-eli5-snippet-tooltips.md`.
- Vigilance à ne pas aggraver : `.todos/0112-eli5-codeblock-hydration-mismatch.md` (bug
  d'hydratation React ouvert sur `Eli5CodeBlock`/`<CodeBlock>`).
- **Correction de doc au passage** : `CLAUDE.md` (commande `yarn eli5`) décrit la génération comme
  passant par Ollama ; en réalité les trois scripts appellent l'API Anthropic Claude
  (`claude-haiku-4-5-20251001`, `@anthropic-ai/sdk`). À corriger dans `CLAUDE.md` indépendamment de
  ce TODO — mention laissée ici pour ne pas la perdre.
