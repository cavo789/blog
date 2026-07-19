# 036 — Aucun outillage de lint/format en place malgré le mandat AGENTS.md

**Priority:** High

## Problème

`AGENTS.md` ("Tooling & Quality Control") exige : _"Code and Markdown must be compatible with
strict linting (ESLint, Prettier, Dockerlint, Markdownlint)"_. En réalité :

- Aucun `.eslintrc*` / `eslint.config.*` dans le repo.
- Aucun `.prettierrc*`.
- Aucun `.stylelintrc*`.
- `package.json` ne liste ni `eslint`, ni `prettier`, ni `stylelint` en devDependency.
- `package.json` n'a **aucun script `lint` ou `test`**.
- Les deux workflows GitHub Actions (`deploy.yml`, `blog-post-workflow.yml`) ne font que builder et
  déployer — aucune étape de lint/format/test n'est exécutée en CI.

C'est la cause racine de plusieurs constats de cette review (import mort `CSSProperties` dans
`Card/*`, couleurs hex codées en dur, PropTypes manquants sur 20/45 composants) : rien
n'empêche ces régressions d'entrer, et rien ne les détecte après coup.

## Risque

Dérive de qualité continue et invisible. Chaque nouveau composant recommence à zéro (pas de garde-
fou automatique), et la review manuelle devient le seul filet de sécurité — non scalable au fur et
à mesure que le blog grossit (238 articles, ~150 fichiers de composants aujourd'hui).

## Solution proposée

1. Ajouter ESLint (config `eslint-plugin-react` + `eslint-plugin-react-hooks`, pas de TypeScript
   parser puisque le projet est explicitement JS-only — voir [[037]]), Prettier, et un stylelint
   minimal (au moins la règle `color-no-hex` pour renforcer "no hardcoded hex colors").
2. Ajouter les scripts `lint`, `format:check` dans `package.json`.
3. Ajouter une étape `lint` (et idéalement `build`) comme job CI obligatoire, séparée du déploiement,
   qui bloque le merge en cas d'échec.
4. Documenter la commande dans `AGENTS.md`/README pour que ce soit une seule commande, cohérente
   avec l'objectif pédagogique "CLI usage is mandatory".

## Cheatsheet

Ajoute une entrée dans la console (cheatsheet) que tu trouveras dans le fichier .devcontainer/bash_helpers.sh.

AInsi, depuis le terminal de mon devcontainer, je peux lancer une commande pour valider la qualité du projet. Je songeais à priori à "lint" mais cela existe déjà pour les fichiers markdown.

## Lien avec l'existant

Root cause commune à [[038]] (Card `CSSProperties` mort), [[039]] (couleurs hex), [[040]]
(PropTypes manquants). Ces trois TODOs corrigent l'état actuel ; celui-ci empêche la régression
future — à faire en premier ou en parallèle.

## Status — PARTIAL (2026-07-09)

### Done

- **ESLint** : `eslint.config.js` (flat config) avec `eslint-plugin-react` +
  `eslint-plugin-react-hooks`, pas de parser TypeScript (cohérent avec [[037]] tant que la question
  BrowserWindow n'est pas tranchée). `blog/**` et `.unpublished/**` exclus (ce sont des snippets
  pédagogiques co-localisés dans les articles, pas du code applicatif). Les motifs `ignores`
  utilisent des globs `**/` indépendants de la profondeur : détecté en route qu'un worktree Git
  concurrent sous `.claude/worktrees/` contient sa propre copie de `blog/`, et un glob non préfixé
  (`"blog/**"`) ne l'aurait pas exclue.
- **Stylelint** : `.stylelintrc.json` sur `stylelint-config-standard`, avec la règle `color-no-hex`
  demandée (en avertissement, pointant vers [[039]]) plus un calibrage pour coller aux conventions
  réelles du projet (media queries `min-width`/`max-width` classiques, `rgba()`, préfixes
  `-webkit-` nécessaires pour Safari, CSS Modules `:global`) — sans quoi le preset standard
  produisait ~425 erreurs de pure notation sans rapport avec de vrais bugs.
- **Prettier** : `.prettierrc.json` + `.prettierignore` ajoutés.
- Scripts `package.json` : `lint:js`, `lint:css`, `lint`, `format`, `format:check`.
- **CI** : `.github/workflows/quality.yml`, nouveau workflow séparé de `deploy.yml`, exécute
  `yarn lint` sur chaque push/PR.
- **Cheatsheet devcontainer** : alias `codelint` ajouté dans `.devcontainer/bash_helpers.sh` (le nom
  `lint` étant déjà pris par markdownlint), avec son entrée dans le message d'accueil.
- `AGENTS.md` mis à jour pour documenter l'outillage réel (plus de mandat aspirationnel non tenu).
- `yarn lint` passe avec 0 erreur (182 avertissements JS + 345 avertissements CSS, tous des dettes
  pré-existantes tracées par [[039]]/[[040]], pas de nouvelles régressions).
- En calibrant l'outil, plusieurs bugs réels triviaux détectés par le linter ont été corrigés au
  passage (mécaniques, sans risque) : `<div class="content">` → `className` dans `Details/index.js`
  (le `class` React ne fait rien) ; import mort `{ CSSProperties }` non touché ici mais confirmé
  inoffensif (voir [[038]] pour le nettoyage complet) ; `word-wrap` → `overflow-wrap` (propriété
  dépréciée) dans `Card/styles.module.css` ; `tab-index: -1` en CSS supprimé dans
  `TypoReport/styles.module.css` (propriété CSS inexistante — le vrai `tabIndex={-1}` React est déjà
  posé côté JSX, donc sans effet) ; règle CSS vide `.blueskyCommentFooter {}` supprimée dans
  `Bluesky/styles.module.css` ; échappements regex inutiles et `throw new Error(..., { cause })`
  manquant corrigés dans `plugins/remark-tree-to-component/index.cjs` et
  `scripts/generate-eli5.mjs` (tous deux hors `src/components`, mais nécessaires pour que
  `yarn lint` passe sans dette cachée). `yarn build` reste vert après ces changements.

### Not done

- **`react/prop-types` reste en `"warn"` partout**, y compris dans `src/components`, au lieu
  d'`"error"` strict comme le suggérait la solution initiale. Le passer en erreur immédiatement
  aurait fait échouer `yarn lint` sur les ~33 violations déjà connues dans `src/components` (et 70+
  dans `src/theme`, découvertes au passage — hors scope de cette review mais à garder en tête).
  **Raison :** éviter qu'une PR d'outillage bloque tout le reste du travail avant que [[040]] ne soit
  traité. À durcir (`"error"` scopé à `src/components/**`) une fois [[040]] fermé.
- **`format:check` échoue sur ~166 fichiers** (le code n'a jamais été passé au formateur) et n'est
  **pas** intégré au job CI `quality.yml`. **Raison :** un reformatage Prettier en masse produirait
  un diff énorme et sans rapport direct avec l'objectif de cette tâche (outillage, pas mise en forme
  rétroactive) ; il mériterait son propre TODO dédié si souhaité.
- **Pas de règle de protection de branche GitHub** empêchant réellement un merge en cas d'échec du
  job `quality.yml` — seul le job CI existe et remonte l'échec visuellement dans l'onglet Actions.
  **Raison :** configurer les règles de protection de branche est un réglage du dépôt GitHub
  (Settings → Branches), pas un fichier versionné ; à faire manuellement par le mainteneur s'il le
  souhaite.
- Découverte annexe non traitée : `src/theme/**` et `src/pages/**` ont eux aussi un déficit
  PropTypes important (70+ et 38 occurrences) et quelques doublons CSS (`no-duplicate-selectors`,
  `declaration-block-no-duplicate-properties`) dans des fichiers hors `src/components`
  (`BlogArchivePage/styles.module.css`, `custom.css`). Non corrigé ici (hors scope de la review
  `src/components` d'origine) ; laissé en avertissement stylelint/eslint pour rester visible.
