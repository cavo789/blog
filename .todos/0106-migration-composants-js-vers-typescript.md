# 0106 — Migration progressive des composants JS/JSX vers TypeScript

- **Priority**: Low — pas de deadline, un composant à la fois
- **Batch**: ts-migration
- **Depends**: —
- **Files**: voir inventaire ci-dessous — tous les `.js`/`.jsx` sous `src/components/`

## Contexte

Décision prise le 2026-08-28 : les nouveaux composants s'écrivent en TypeScript (`.tsx`), plus de
`.js`/`.jsx` neuf. `AGENTS.md` et `CLAUDE.md` ont été mis à jour en conséquence. Les fondations
techniques sont posées dans la même session :

- `tsconfig.json` à la racine (étend `@docusaurus/tsconfig`, `include` limité à `src/**`,
  `scripts/**`, `docusaurus.config.js` — les snippets illustratifs sous `blog/` ne sont pas du
  vrai code source et ne doivent jamais être passés à `tsc`).
- `yarn lint:types` (`tsc --noEmit`), maintenant inclus dans `yarn lint`.
- `eslint.config.js` lint désormais aussi `.ts`/`.tsx` (règles `typescript-eslint` recommandées +
  mêmes règles React que le JS, sauf `react/prop-types` qui n'a pas de sens en TS).
- `@types/react` / `@types/react-dom` (v19, alignés sur la version de React installée).
- `BrowserWindow` (déjà en `.tsx`) a servi de test : un `JSX.Element` global cassait avec
  `@types/react` 19 (le namespace `JSX` n'est plus global) — corrigé en `React.JSX.Element`.
  **À vérifier sur chaque futur composant migré si le pattern `JSX.Element` est réutilisé.**

**2026-08-28 — Niveau 1 traité entièrement en un lot** (17 composants). Migrer un composant
trivial à la fois n'apportait rien : aucun état, aucune dépendance externe, rien à isoler. Les
niveaux suivants reviennent au traitement un par un (ou par petit sous-groupe couplé, ex. `Trees`)
dès que la difficulté ou le rayon d'impact augmente — voir la note ajoutée dans « Approche ».

Deux fondations ajoutées en cours de route, découvertes en migrant, pas anticipées au moment
d'écrire ce TODO :

- [src/global.d.ts](../src/global.d.ts) — `@docusaurus/module-type-aliases` déclare `*.svg`,
  `*.css`, `*.md` mais pas les images raster. `ScrollToTopButton` importe un `.webp` : sans ce
  fichier, `tsc` ne trouve pas de déclaration de module. Servira à tous les composants restants
  qui importent une image (`KonamiEasterEgg`, `AskMyBlogWidget`, `BlogGraph`, `ShakeEasterEgg`,
  niveaux 2 à 5).
- [src/components/Terminal/index.d.ts](../src/components/Terminal/index.d.ts) — `Terminal` est
  encore en JS (niveau 4), mais `Prerequisite` (niveau 1) le rend. Sans déclaration à part,
  `tsc` infère la forme des props depuis la déstructuration de `index.js` et considère `title`,
  `typewriterSpeed`, `typewriterLineDelay` comme obligatoires (ils n'ont pas de valeur par défaut
  dans la signature, alors qu'ils sont bien optionnels à l'usage). Ce fichier `.d.ts` cohabite
  avec `index.js` (TS préfère un `.d.ts` de même nom) et disparaît quand `Terminal` migrera
  lui-même.

**Incident du 2026-08-28 — 4 articles cassés silencieusement**, découvert par l'auteur juste après
le lot niveau 1 : `docusaurus-articles-tips`, `docusaurus-go-top`, `docusaurus-llms-txt` et
`docusaurus-ai-gemini` référençaient le fichier source réel d'un composant (`<Snippet
source="src/components/X/index.js">`) — cassé par le renommage en `.tsx`. Le build ne l'a montré
qu'après un `yarn clear` (le cache webpack masquait la recompilation MDX). Trois correctifs :

1. Les 4 articles + 4 `readme.md` de composants mis à jour vers `.tsx`.
2. [plugins/remark-snippet-loader/index.cjs](../plugins/remark-snippet-loader/index.cjs) —
   `<Snippet>`/`<Terminal>` faisaient dégrader silencieusement un `source` manquant en commentaire
   `// Error loading source file`, sans faire échouer le build. **Corrigé : le plugin lève
   maintenant une erreur explicite** (fichier, article, chemin résolu) et `docusaurus build`
   s'arrête. Testé (`node -e` synthétique) sur les deux branches `Snippet` et `Terminal`.
3. [scripts/check-snippet-sources.mjs](../scripts/check-snippet-sources.mjs) (`yarn lint:snippets`,
   inclus dans `yarn lint`) — même résolution de chemin que le plugin, mais en < 1s contre ~60s
   pour un `yarn build` complet. Ignore les mentions `<Snippet source="...">` données en exemple
   dans du code inline/fenced (plusieurs articles documentent la syntaxe elle-même).

**Conséquence pour la suite du TODO** : `yarn lint` (donc `yarn lint:snippets`) fait maintenant
partie du garde-fou obligatoire après *chaque* composant migré, pas seulement `yarn build` — et un
`yarn clear` avant le build final de vérification, pour ne pas se faire avoir une seconde fois par
un cache MDX qui masquerait une régression.

Ce TODO ne migre pas tout lui-même : c'est l'inventaire + le plan. Le travail réel continue
composant par composant (niveaux 2+), sur plusieurs sessions, via `/todo 0106` ou à la main.

## Approche

1. Niveau 1 (trivial, aucun état/dépendance) : migrer en un seul lot, ça n'a pas de valeur de
   l'étaler. À partir du niveau 2, revenir à un composant (ou petit sous-groupe couplé) à la fois.
2. **Avant** de renommer un fichier, chercher ses références dans le contenu publié :
   `grep -rn "ComponentName/index\.js" blog .unpublished src` (adapter l'extension). Un article
   peut afficher le code source réel du composant via `<Snippet source="...">` — le renommage doit
   mettre à jour l'article (attribut **et** toute prose qui mentionne le nom de fichier) dans le
   même geste, pas après coup (voir l'incident du 2026-08-28 ci-dessus).
3. Renommer `index.js` → `index.tsx` (ou `.js` → `.tsx` pour un fichier nommé), typer les props
   (interface `Props`), remplacer les `PropTypes` par les types correspondants, supprimer l'import
   `prop-types` devenu inutile. Un fichier `.js.eli5.json` sidecar doit être renommé en
   `.tsx.eli5.json` en même temps que sa source (sinon `check-eli5-freshness.mjs` le voit comme
   orphelin).
4. Après chaque lot/composant : `yarn lint && yarn format:check && yarn clear && yarn build`
   (le `yarn clear` évite qu'un cache MDX masque une régression — voir l'incident du 2026-08-28
   ci-dessus), puis vérification visuelle dans le navigateur (composants utilisés dans plusieurs
   articles → tester au moins un article qui l'utilise réellement, pas juste un rendu isolé).
   `yarn lint` inclut désormais `yarn lint:snippets` : tout `<Snippet>`/`<Terminal source=...>`
   pointant vers le fichier renommé est détecté avant même le build.
5. Laisser tourner quelques jours avant d'enchaîner sur le lot suivant, pour repérer une
   régression qui n'apparaîtrait qu'à l'usage (cache navigateur, SSR vs hydratation, etc.).
6. Ne pas migrer un composant et refactorer sa logique dans la même passe — deux commits
   distincts si un refactor s'impose en cours de route. Si `tsc` force un cast pour préserver un
   comportement JS existant (ex. `Image`, `DownloadButton`), documenter pourquoi en commentaire
   plutôt que de corriger le comportement au passage.

## Inventaire, classé par difficulté croissante

Mesure : nombre de fichiers `.js`/`.jsx` et lignes totales (hors `styles.module.css`). La
difficulté tient aussi compte de la complexité réelle (state, contexte, dépendances externes),
pas seulement du nombre de lignes.

### Niveau 1 — Triviaux (bon point de départ, 1 fichier, peu ou pas de state)

**Terminé le 2026-08-28**, en un seul lot (voir « Contexte » ci-dessus).

| Fait | Composant | Fichiers | Lignes | Note |
| --- | --- | --- | --- | --- |
| [x] | `Column` | 1 | 22 | — |
| [x] | `Columns` | 1 | 24 | — |
| [x] | `Blog/SeriesStats` | 1 | 24 | — |
| [x] | `Blog/AIIcon` | 1 | 19 | — |
| [x] | `MarkdownAlternate` | 1 | 24 | — |
| [x] | `OpenGraphArticle` | 1 | 33 | Cast ajouté sur `frontMatter.lastUpdated` (champ front matter custom, typé `unknown` par Docusaurus) |
| [x] | `Blog/PostCount` | 1 | 33 | — |
| [x] | `Details` | 1 | 34 | — |
| [x] | `ShortcutList` | 1 | 34 | — |
| [x] | `Highlight` | 1 | 35 | — |
| [x] | `Prerequisite` | 1 | 38 | A nécessité `Terminal/index.d.ts` (voir « Contexte ») |
| [x] | `ConnectionInfo` | 1 | 40 | — |
| [x] | `Hero` | 1 | 40 | — |
| [x] | `Image` | 1 | 40 | Cast préservé sur `src` (objet `require()` vs chaîne) — comportement JS d'origine inchangé |
| [x] | `ReadingProgress` | 1 | 30 | — |
| [x] | `ScrollToTopButton` | 1 | 47 | A nécessité `src/global.d.ts` (import `.webp`, voir « Contexte ») |
| [x] | `DownloadButton` | 1 | 54 | Cast préservé sur `file` (objet `require()` vs chaîne) — comportement JS d'origine inchangé |

### Niveau 2 — Simples (1 fichier, un peu de state/props, pas de dépendance externe)

| Composant | Fichiers | Lignes | Note |
| --- | --- | --- | --- |
| `MyRepositories` | 1 | 56 | — |
| `TLDR` | 1 | 62 | — |
| `Blog/SeriesCards` | 1 | 64 | — |
| `Blog/LatestPosts` | 1 | 67 | — |
| `Analytics` | 1 | 71 | — |
| `CopyAsMarkdown` | 1 | 72 | — |
| `MainTags` | 1 | 72 | — |
| `Blog/Updated` | 1 | 75 | — |
| `Blog/MobileQuickLinks` | 1 | 79 | — |
| `KonamiEasterEgg` | 1 | 80 | — |
| `StepsCard` | 1 | 80 | — |
| `HomeCards` | 1 | 81 | — |
| `Blog/RelatedPosts` | 1 | 81 | — |
| `Blog/AlertBox` | 1 | 85 | Très utilisé (toutes les alertes du blog) — migrer, tester large avant de continuer |
| `Blog/HeroSection` | 1 | 85 | — |
| `Blog/OldPostNotice` | 1 | 87 | — |
| `InstallPwaHint` | 1 | 91 | — |
| `FaqThemePage` | 1 | 96 | — |
| `Blog/SeriesPosts` | 1 | 98 | — |
| `Blog/LogoIcon` | 2 | 26 | — |

### Niveau 3 — Moyens (plusieurs fichiers ou logique plus riche)

| Composant | Fichiers | Lignes | Note |
| --- | --- | --- | --- |
| `Blog/Tags` | 1 | 103 | — |
| `StructuredData` | 1 | 110 | — |
| `Reaction` | 1 | 117 | SSR/hydratation particulière, documentée en commentaire dans le fichier — lire avant de toucher |
| `OfflineNotice` | 1 | 113 | — |
| `Blog/PostCard` | 1 | 114 | Rendu de carte réutilisé partout dans les listings — tester plusieurs listings après migration |
| `ShakeEasterEgg` | 1 | 121 | — |
| `Blog/Series` | 1 | 133 | — |
| `Trees` (`Trees`/`Folder`/`File`) | 4 | 204 | 3 sous-composants couplés — migrer les 4 fichiers ensemble, pas un par un |

### Niveau 4 — Complexes (gros volume, plusieurs fichiers, état riche ou dépendance externe)

| Composant | Fichiers | Lignes | Note |
| --- | --- | --- | --- |
| `AskMyBlogWidget` | 1 | 164 | — |
| `AskMyBlog` | 3 | 250 | Appelle une API externe (AnythingLLM) — tester le mode dégradé (API down) après migration |
| `Card` | 6 | 305 | Composant générique très réutilisé — gros rayon d'impact, valider plusieurs usages |
| `TypoReport` | 1 | 305 | — |
| `Terminal` | 1 | 308 | Très utilisé dans les articles (`<Terminal source="...">`) — valider plusieurs articles |
| `ProjectSetup` | 1 | 320 | — |
| `GithubProjects` | 1 | 329 | Appelle l'API GitHub — tester le mode dégradé (rate-limit/API down) |
| `Snippet` | 1 | 566 | Logique de parsing dense — la plus longue en un seul fichier, prévoir plus de temps |
| `Vars` (`store` + `substitute` + …) | 6 | 622 | **Store/contexte partagé**, importé par `BrowserWindow` et d'autres — migrer en dernier de ce niveau, casser `Vars` casse tout ce qui en dépend |

### Niveau 5 — À part : haut risque, migrer en dernier

| Composant | Fichiers | Lignes | Pourquoi en dernier |
| --- | --- | --- | --- |
| `Blog/utils` | 7 | 301 | Plomberie centrale (`posts.js`, `require.context`) documentée comme sensible dans `CLAUDE.md` — « lire leurs commentaires avant de toucher ». À migrer seul, avec revue attentive, pas en série avec d'autres composants. |
| `BlogGraph` | 3 | 807 | Graphe de force D3 — logique de simulation physique, régression difficile à repérer visuellement sans tester plusieurs tailles d'écran. |
| `CommandPalette` | 4 | 1088 | Le plus gros composant du repo, navigation clavier + recherche — tester exhaustivement tous les raccourcis après migration. |
| `Bluesky` | 6 | 772 | En évolution active (`blueskyRecordKey` rendu optionnel le 2026-08-28, commit `209f5afa`) — **attendre que cette fonctionnalité se stabilise** avant de migrer, pour ne pas mélanger changement de fonctionnalité et changement de langage dans le même diff. |

**Déjà fait :** `BrowserWindow` (`.tsx` de longue date, a servi de pilote pour ce TODO).

**Hors périmètre de ce TODO :** `src/pages`, `src/theme` (swizzled), `scripts/*.mjs`. Même
logique de migration progressive applicable plus tard si souhaité, mais governance
(`AGENTS.md`) ne couvre explicitement que `src/components/`.

## Risque

- **Un composant à moitié migré est pire qu'un composant JS.** Ne jamais laisser un composant
  dans un état où le fichier est renommé `.tsx` mais les types sont `any` partout — autant
  rester en JS dans ce cas, ça n'apporte rien.
- **`Vars` et `Blog/utils` ont un rayon d'impact large** (store partagé / plomberie de listing) —
  une régression y est plus difficile à isoler qu'un composant MDX autonome. Ne pas les migrer
  en même temps qu'autre chose.
- **`Bluesky` est en mouvement** (voir commit `209f5afa`) — migrer maintenant risquerait de
  produire un diff qui mélange changement de comportement et changement de langage, rendant un
  éventuel rollback plus difficile à cibler.

## Acceptance

- [ ] Niveau 1 entièrement migré et stable depuis au moins quelques jours en usage réel
- [ ] Niveau 2 entièrement migré et stable
- [ ] Niveau 3 entièrement migré et stable
- [ ] Niveau 4 entièrement migré et stable
- [ ] Niveau 5 traité en dernier, un par un, avec revue dédiée pour `Blog/utils`
- [ ] Cette liste est tenue à jour (cocher/rayer au fur et à mesure) plutôt que remplacée par un
      nouveau TODO
- [ ] `yarn lint && yarn format:check && yarn clear && yarn build` passent après chaque composant
      migré (le `yarn clear` est nécessaire — un cache MDX peut masquer une régression, voir
      l'incident du 2026-08-28)
- [ ] Avant chaque renommage, les références dans `blog/`, `.unpublished/` et les `readme.md` de
      composants ont été cherchées et mises à jour dans le même geste
