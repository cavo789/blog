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

**2026-08-28 — Niveau 2 traité entièrement en un lot** (20 composants), sur demande explicite après
validation visuelle du niveau 1 en production pendant quelques jours. Quatre motifs récurrents
découverts pendant ce lot, à surveiller dans les niveaux suivants :

- **`new Date(a) - new Date(b)` ne compile pas.** `tsc` refuse la soustraction directe de deux
  `Date` (`TS2362`/`TS2363`) — remplacer par `.getTime() - .getTime()`. Touché 3 fois
  (`Blog/Updated`, `Blog/OldPostNotice`, `Blog/SeriesPosts`) ; pattern courant partout où un
  composant trie des posts par date (`getBlogMetadata()` en amont).
- **Un import avec extension explicite (`.../ComponentName/index.js`) casse au renommage.**
  Contrairement à un import sans extension (résolu automatiquement vers `.tsx`), webpack/TS ne
  devinent pas l'extension quand elle est donnée explicitement. Trouvé dans
  `src/theme/BlogPostItem/index.js` et `src/theme/BlogPostItem/Content/index.js` (3 imports), plus
  4 copies illustratives (`blog/**/files/index.js`) montrant le même fichier swizzlé dans des
  articles plus anciens — toutes corrigées en imports sans extension. **Grep avant tout renommage**
  (déjà dans « Approche ») doit chercher `ComponentName/index\.(js|jsx)"` (avec le guillemet final)
  pour attraper spécifiquement ce cas, pas seulement les `<Snippet source="...">`.
- **Un champ frontmatter custom (`updates`, `review_date`, `mainTag`, …) est typé `unknown` par
  Docusaurus**, pas par ce projet — seuls les champs que Docusaurus connaît nativement (`tags`,
  `date`, …) ont un vrai type. Un simple accès/passage (`frontMatter.mainTag` transmis à une
  fonction JS non typée) ne pose pas de problème ; un appel de méthode dessus (`.length`, `.sort`,
  spread) exige un cast explicite (voir `Blog/OldPostNotice`).
- **Un composant TSX qui rend un composant encore-JS avec des props optionnelles sans valeur par
  défaut** se heurte au même problème que `Terminal/index.d.ts` (niveau 1) : `tsc` les infère
  comme obligatoires. Nouveaux `.d.ts` sidecars ajoutés pour `Card`, `Card/CardImage`,
  `Card/CardBody` (consommés par `HomeCards`) — même mécanisme, à réutiliser dès qu'un autre
  composant encore-JS bloque une migration de cette façon.

Ce TODO ne migre pas tout lui-même : c'est l'inventaire + le plan. Le travail réel continue
composant par composant (niveaux 2+), sur plusieurs sessions, via `/todo 0106` ou à la main.

**2026-08-28 — `strict: true` activé dans `tsconfig.json`, AVANT le niveau 5** (sur demande
explicite de l'auteur, but = robustesse). `@docusaurus/tsconfig` ne l'active pas ; sans lui
`tsc --noEmit` passait mais ne vérifiait ni `strictNullChecks` ni `noImplicitAny`. 47 erreurs à
corriger, réparties ainsi et toutes traitées **sans `any` ni `@ts-ignore`** :

- **~30 (TS7006 + TS2339)** : les composants `Blog/*` consomment les objets `post` / `serie`
  renvoyés par `Blog/utils/*.js` (niveau 5, encore JS) — `tsc` les infère `Object[]`. Corrigé par
  **3 nouveaux `.d.ts` sidecars** : [posts.d.ts](../src/components/Blog/utils/posts.d.ts)
  (`BlogPostMetadata` + `getBlogMetadata`), [series.d.ts](../src/components/Blog/utils/series.d.ts)
  (`SeriesListEntry` + `generateSeriesList`),
  [related.d.ts](../src/components/Blog/utils/related.d.ts) (`getRelatedPosts`), plus
  [src/data/series.d.ts](../src/data/series.d.ts) (`SeriesDataEntry`, avec `title?`/`counter?`
  optionnels que `SeriesCards` lit en `?? fallback`). **Ces 4 fichiers disparaissent quand
  `Blog/utils` migre (niveau 5)** — remplacés par des `export` de types inline, comme les
  sidecars `Card`/`Terminal` au niveau 4.
- **`frontMatter.mainTag` typé `unknown`** (champ custom Docusaurus) passé à un helper désormais
  typé → cast `as string | undefined` au site d'appel (`RelatedPosts`, `MobileQuickLinks`) —
  même motif que niveaux 2-3.
- **`PostCard`** : `Post.description` et `Post.mainTag` élargis à `string | null` (les appelants
  passent `{ ...post, description: null }` pour masquer la description ; `mainTag` est
  `string | null` en amont). Tous les usages sont déjà gardés par `{x && …}`.
- **`SeriesArticlesPage`** : `seriesPosts[0]?.series ?? slug` au lieu du ternaire (narrowing
  `string | null` → `string`, comportement identique car la liste est filtrée sur `series`
  truthy).
- **`SeriesCards`** : `description: data?.description` (le `?? serie.description` visait un champ
  que `generateSeriesList()` ne produit pas — mort au runtime, retiré).
- **`StructuredData`** : cast `updates` resserré en `{ date: string; note?: string }[]` (toujours
  les deux clés en front matter).
- **`ShakeEasterEgg`** : garde les 3 axes `acceleration.x/y/z !== null` (pas seulement `x`) —
  `DeviceMotionEventAcceleration` les type `number | null`.
- **`ProjectSetup`** : `if (!folder) throw` après `zip.folder()` (typé `JSZip | null`) — l'erreur
  est déjà attrapée et remontée via `setZipError`.
- **`TypoReport`** : `handleSelection` passé de `function` déclaration à arrow `const` pour que
  TS propage le narrowing `if (!article) return` dans la closure (sinon `article` redevient
  `HTMLElement | null` à l'intérieur).

Garde-fou : `yarn lint` (0 err) + `yarn format:check` + `yarn clear && yarn build` (63s) OK.
**Conséquence pour la suite** : tout composant migré au niveau 5 est désormais tenu au `strict` —
`strictNullChecks` en particulier va remonter des accès `x.y` sur `Blog/utils` (D3, force graph)
qui passaient avant.

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

**Terminé le 2026-08-28**, en un seul lot (20 composants) — même choix que le niveau 1, sur
demande explicite après validation visuelle du niveau 1 en production.

| Fait | Composant | Fichiers | Lignes | Note |
| --- | --- | --- | --- | --- |
| [x] | `MyRepositories` | 1 | 56 | — |
| [x] | `TLDR` | 1 | 62 | — |
| [x] | `Blog/SeriesCards` | 1 | 64 | — |
| [x] | `Blog/LatestPosts` | 1 | 67 | `new Date(a) - new Date(b)` → `.getTime()` (tsc refuse la soustraction directe de deux `Date`) |
| [x] | `Analytics` | 1 | 71 | Fichier réel : `Analytics/MatomoRouteTracker/index.tsx`. `window._paq` (Matomo) typé via `declare global { interface Window {...} }` local au fichier |
| [x] | `CopyAsMarkdown` | 1 | 72 | Référencé par un brouillon (`.unpublished/copy-as-markdown`) qui montre le vrai fichier — mis à jour aussi |
| [x] | `MainTags` | 1 | 72 | — |
| [x] | `Blog/Updated` | 1 | 75 | Même fix `.getTime()`. Importé avec extension explicite (`/index.js`) depuis `src/theme/BlogPostItem/Content/index.js` — cassait le renommage, corrigé en import sans extension |
| [x] | `Blog/MobileQuickLinks` | 1 | 79 | — |
| [x] | `KonamiEasterEgg` | 1 | 80 | — |
| [x] | `StepsCard` | 1 | 80 | — |
| [x] | `HomeCards` | 1 | 81 | Rend `Card`/`CardBody`/`CardImage` (niveau 4, encore JS) — a nécessité 3 `.d.ts` sidecars (voir « Contexte ») |
| [x] | `Blog/RelatedPosts` | 1 | 81 | Import avec extension explicite depuis `src/theme/BlogPostItem/index.js` — même correction qu'`Updated` |
| [x] | `Blog/AlertBox` | 1 | 85 | Très utilisé (toutes les alertes du blog) — migré, testé large avant de continuer |
| [x] | `Blog/HeroSection` | 1 | 85 | — |
| [x] | `Blog/OldPostNotice` | 1 | 87 | Même fix `.getTime()` ; `frontMatter.updates`/`review_date` (champs custom, typés `unknown` par Docusaurus) castés explicitement. Import avec extension explicite — même correction |
| [x] | `InstallPwaHint` | 1 | 91 | `BeforeInstallPromptEvent` et `navigator.standalone` n'existent pas dans `lib.dom` — interface locale + cast |
| [x] | `FaqThemePage` | 1 | 96 | — |
| [x] | `Blog/SeriesPosts` | 1 | 98 | Même fix `.getTime()`. Import avec extension explicite — même correction |
| [x] | `Blog/LogoIcon` | 2 | 26 | `iconBundle.generated.js` reste en `.js` (fichier généré, hors périmètre) ; `forEach(addCollection)` → `forEach((c) => addCollection(c))` (le 2ᵉ argument de `forEach`, l'index, ne correspond pas au 2ᵉ paramètre `provider` d'`addCollection`) |

### Niveau 3 — Moyens (plusieurs fichiers ou logique plus riche)

**Terminé le 2026-08-28**, en un seul lot (8 composants / 11 fichiers), sur demande explicite après
validation visuelle des niveaux 1 et 2 en production. Motifs récurrents de ce lot :

- **`match.params` est typé `{}` par `matchPath`.** `matchPath(pathname, {...})` sans paramètre de
  type générique renvoie `match<{}>`, donc `match?.params?.slug` ne compile pas (`TS2339`).
  Corrigé en `matchPath<{ slug: string }>(...)` (`Blog/Tags`, `Blog/Series`).
- **Un objet `style` avec des CSS custom properties (`--series-accent-solid`) n'est pas un
  `React.CSSProperties`.** `tsc` refuse les clés `--*` quel que soit `strict`. Cast explicite
  `as CSSProperties` sur l'objet entier (`Blog/Series`, `heroStyle`).
- **`<Head script={[{ type, innerHTML }]} />` ne compile pas** : l'alias `@docusaurus/Head` rend
  `children` obligatoire. Repassé à la forme enfant idiomatique Docusaurus
  `<Head><script type="application/ld+json">{JSON.stringify(jsonLd)}</script></Head>` — sortie
  HTML identique (vérifié dans le build : bloc JSON-LD `dateModified`/`author` intact).
- **`ReturnType<typeof setTimeout>` résout vers `NodeJS.Timeout`** (à cause de `@types/node`),
  pas `number` — l'affectation `ref.current = window.setTimeout(...)` échoue. Refs de timer typées
  `useRef<number | undefined>` pour du code navigateur (`OfflineNotice`, `ShakeEasterEgg`).
- **`frontMatter.updates` typé `unknown`** (champ custom) — cast local avant `.length`/`.sort`
  (`StructuredData`), même motif que niveau 2 (`OldPostNotice`).
- **`React.cloneElement(child, { level })` sur un enfant `ReactElement<unknown>`** : `{ level }`
  est refusé (propriété inconnue). Cast `child as React.ReactElement<{ level?: number }>`
  (`Trees`, `TreeItem`).
- **Fondation ajoutée** : le bloc ESLint `.ts`/`.tsx` d'[eslint.config.js](../eslint.config.js)
  n'héritait pas de `no-empty` avec `allowEmptyCatch` (présent côté JS). `Reaction` a un
  `catch {}` best-effort (localStorage) — règle ajoutée au bloc TS pour parité.

| Fait | Composant | Fichiers | Lignes | Note |
| --- | --- | --- | --- | --- |
| [x] | `Blog/Tags` | 1 | 103 | `matchPath<{ slug: string }>` ; `getTagLabel(t: string \| { label: string })`. Article `docusaurus-cards` mis à jour |
| [x] | `StructuredData` | 1 | 110 | `.jsx` → `.tsx`. `<Head>` repassé en forme enfant ; casts sur `updates`/`description`/`themeConfig.image` (typés `unknown`). `readme.md` mis à jour |
| [x] | `Reaction` | 1 | 117 | `index.js.eli5.json` renommé. `Counts`/`voted` typés ; SSR/hydratation inchangée. Règle `no-empty` ajoutée au bloc TS ESLint. Article `reactions` : refs `<Snippet>` live + prose + tableau mis à jour (les extraits de code section par section restent en JS, déjà désynchronisés avant migration — hors périmètre) |
| [x] | `OfflineNotice` | 1 | 113 | Refs de timer `useRef<number>` + `window.setTimeout` ; `event.target` casté `Element`, lien casté `HTMLAnchorElement`. Aucune référence externe |
| [x] | `Blog/PostCard` | 1 | 114 | `index.js.eli5.json` renommé. Interface `Post` (permalink/title requis, reste optionnel) — consommateurs `.tsx` (SeriesCards/RelatedPosts/LatestPosts) passent des objets `any`, aucune friction. Articles `docusaurus-series`/`docusaurus-snippets` + `readme.md` mis à jour. Vérifié : 93 cartes sur `/blog/tags/docker`, 21 sur page série |
| [x] | `ShakeEasterEgg` | 1 | 121 | `handleMotion(event: DeviceMotionEvent)` ; refs timer `useRef<number>` ; `Phase` union. Article `docusaurus-shake-easter-egg` + `readme.md` mis à jour |
| [x] | `Blog/Series` | 1 | 133 | `SeriesArticlesPage.js.eli5.json` renommé. `matchPath<{ slug: string }>` ; `heroStyle as CSSProperties` (custom props) ; `.getTime()`. Article `docusaurus-series` mis à jour |
| [x] | `Trees` (`Trees`/`Folder`/`File`/`utils/TreeItem`) | 4 | 204 | Les 4 fichiers migrés ensemble. `cloneElement` : cast `ReactElement<{ level?: number }>`. `LogoIcon` (niveau 2, déjà `.tsx`) fournit ses types. Aucune référence blog/readme |

### Niveau 4 — Complexes (gros volume, plusieurs fichiers, état riche ou dépendance externe)

**Terminé le 2026-08-28**, en un seul lot (9 composants / 23 fichiers), sur demande explicite
après validation en production des niveaux 1-3. Ordre respecté : `Vars` migré en dernier.
Motifs récurrents / pièges de ce lot :

- **`.d.ts` sidecars supprimés** : `Card/index.d.ts`, `Card/CardBody/index.d.ts`,
  `Card/CardImage/index.d.ts`, `Terminal/index.d.ts` — remplacés par des `interface Props`
  inline reprenant exactement le même contrat. Les consommateurs `.tsx` (`PostCard`,
  `HomeCards`, `Prerequisite`, `GithubProjects`) compilent sans changement.
- **Import avec extension `.js` hors `src/components/`** (donc invisible pour `tsc`, qui
  n'inclut ni `src/pages` ni les `.mdx`) : `src/theme/MDXComponents.js` **et**
  `src/pages/project_setup.mdx` importaient `ProjectSetup/index.js`. Corrigés en imports sans
  extension — **le build (pas `tsc`) est le seul filet pour ce cas**. `git grep` de
  `components/.../index\.js"` sur `src` + `plugins` + `*.mdx` fait maintenant partie du réflexe.
- **`prismjs` non typé** (`@types/prismjs` absent) : `import Prism` → `any` toléré (`strict`
  off ⇒ `noImplicitAny` off). Ne pas ajouter le paquet de types juste pour ça.
- **`ReturnType<typeof setTimeout>`** : côté `window.setTimeout` (navigateur) ⇒ typer les refs
  `useRef<number>` ; côté `setTimeout` nu, `ReturnType<typeof setTimeout>` (= `NodeJS.Timeout`)
  s'affecte correctement (`ProjectSetup`).
- **`child.props` est `unknown` en `@types/react` 19** : tout accès (`.className`, `.children`,
  `.filename`…) exige un cast `as { … }` (`Snippet`, `Terminal`, `ProjectSetup`,
  `Vars/substitute`). `cloneElement(child, { extra })` : caster `child` en
  `ReactElement<{ extra?: … }>` (déjà vu au niveau 3 avec `Trees`).
- **Composants-marqueurs à prop statique** (`Guideline.isGuideline = true`) :
  `Object.assign(() => null, { isGuideline: true })` au lieu de l'affectation post-déclaration.
- **`<Head script={[…]} />`** : déjà corrigé au niveau 3 (`StructuredData`) — non rencontré ici.
- **`languageColors[key]` / `mapLangToVariant[ext]`** : typer en `Record<string, string>` et
  garder l'index non-`undefined` (`key ?? ""`).
- **Icônes SVG inline** (`const CopyIcon = (props) => <svg {...props}>`) : `props: SVGProps<SVGSVGElement>`.

| Fait | Composant | Fichiers | Lignes | Note |
| --- | --- | --- | --- | --- |
| [x] | `AskMyBlogWidget` | 1 | 164 | Refs `HTMLDivElement`/`HTMLButtonElement` ; `clearOverlayRef: (() => void) \| null`. Brouillon `.unpublished/docusaurus-ask-my-blog-bubble` mis à jour |
| [x] | `AskMyBlog` | 3 | 250 | `index.js`→`.tsx`, `utils.js`+`questionsIndex.js`→`.ts`. Types partagés `QuestionEntry`/`SearchIndex` exportés de `utils.ts`. `CommandPalette`/`faq.js` (encore JS) non impactés. Brouillon `.unpublished/docusaurus-ask-my-blog` : refs `<Snippet>` + extrait `tokenize` mis à jour |
| [x] | `Card` (`Card`/`CardBody`/`CardHeader`/`CardFooter`/`CardImage` + `utils`) | 6 | 305 | 5 `.js.eli5.json` renommés, 3 `.d.ts` supprimés. `CardTextOptions` partagé (`utils.ts`) pour Body/Header/Footer. Articles `docusaurus-cards`/`docusaurus-series` mis à jour. Vérifié : cartes rendues sur listings, page série, `/repositories` |
| [x] | `TypoReport` | 1 | 305 | `Phase` union ; `StoredReport` ; `e.currentTarget.elements.namedItem("website")` (bracket string interdit sur `HTMLFormControlsCollection`). Pas de `<Snippet source>` live. Le brouillon `.unpublished/typo-report-docusaurus/index.md` contient ~250 lignes de code `TypoReport` recopié à la main (JS + `propTypes`) : **laissé en JS**, cohérent en tant que tutoriel JS ; à réconcilier quand ce brouillon sera repris (rewrite complet, hors périmètre migration) |
| [x] | `Terminal` | 1 | 308 | `index.js.eli5.json` renommé, `index.d.ts` supprimé. `getCopyText` : `HeadingPrefixMap = Map<unknown, string>` + cast `ReactElement`. `Icon from "./icon.svg"` : typé par `module-type-aliases`. Articles `terminal-typewriter-animation`, `docusaurus-project-setup` + `readme.md` mis à jour. Vérifié : ghost/cursor/animation sur l'article typewriter |
| [x] | `ProjectSetup` | 1 | 320 | `index.js.eli5.json` renommé. `Guideline`/`EmptyFolder` via `Object.assign`. Import `.js` corrigé dans `MDXComponents.js` **et** `src/pages/project_setup.mdx` (attrapé par le build, pas `tsc`). Article `docusaurus-project-setup` : refs + Guideline `npm install prop-types clsx` → `clsx` (prop-types supprimé) |
| [x] | `GithubProjects` | 1 | 329 | Interfaces `Repo`/`Filters`. Consomme `Card`/`CardHeader`/`CardFooter`/`CardBody` (migrés juste avant). `readme.md` (`GithubProjects.js` → `index.tsx`). Vérifié : `/repositories` SSR l'état « Loading » (fetch client) |
| [x] | `Snippet` | 1 | 566 | `index.js.eli5.json` renommé. `mapLangToVariant`/`variantIcons` en `Record`. `Prism` = `any` (non typé). `Eli5CodeBlockProps` ; refs badge `Record<string, HTMLButtonElement \| null>`. Articles `docusaurus-snippets`, `eli5-snippet-docusaurus` mis à jour (dont diagramme ASCII) ; prose « Javascript / bordure jaune » retirée. **Support `ts`/`tsx` ajouté** (variante `ts`, bordure `#3178c6`, icône `logos:typescript-icon`) : `mapLangToVariant` + `variantIcons` + `.variant_ts` dans `styles.module.css` + `logos:typescript-icon` ajouté à `scripts/generate-icon-bundle.mjs` et `yarn icons:bundle` relancé (35 icônes). Vérifié dans le build : `variant_ts` + logo TS inline sur les snippets `.tsx` (7× sur `docusaurus-series`, `Terminal/index.tsx`, …) |
| [x] | `Vars` (`index`/`Code`/`Var`/`VarToken` + `store`/`substitute`) | 6 | 622 | Migré **en dernier**. `store.ts` exporte `VarResolver` ; `substitute.ts` importe `VarResolver`/`RenderToken`. `Vars` : `Props` avec index signature + cast `rest as Record<string,string>`. `BrowserWindow.tsx` (déjà `.tsx`) : commentaire `substitute.js`→`.ts`. `readme.md` + commentaires croisés mis à jour. Vérifié : `varsbar`, `tokenInline`, résolution `%%marker%%` dans `docker-init` |

**Gap `Snippet` fermé le 2026-08-28** : les snippets `.ts`/`.tsx` (tous les composants migrés
lots 1-4, affichés via `<Snippet source>`) ont maintenant leur bordure bleu TS + logo
TypeScript, comme n'importe quel autre langage. Coloration syntaxique : déjà OK avant (le plugin
`remark-snippet-loader` mappe `.ts`/`.tsx` → `typescript` ⇒ `language-typescript` ⇒ Prism).

### Niveau 5 — À part : haut risque, migrer en dernier

**`BlogGraph` migré le 2026-08-28** (3 fichiers, 807 lignes), sur demande explicite ciblant ce
seul composant. Moins risqué qu'anticipé : le composant client ne fait *aucune* simulation
`d3-force` (celle-ci tourne à la build dans `plugins/blog-graph-plugin`, hors périmètre de ce
TODO — voir « Hors périmètre » plus bas) — juste du dessin canvas 2D sur des positions déjà
figées. Types ajoutés dans `utils.ts` (`BlogGraphNode`, `BlogGraphEdge`, `BlogGraphData`,
`Transform`, `MeerkatSpot`) reflétant exactement la forme produite par le plugin (vérifiée en
lisant `plugins/blog-graph-plugin/index.mjs`, qui reste `.mjs`/hors périmètre). `usePluginData()`
est typé `unknown` par `@docusaurus/types` — cast explicite `as BlogGraphData | undefined` au
point d'appel, même motif que niveau 5 `Blog/utils` (données externes non typées par le projet).
Brouillon `.unpublished/docusaurus-blog-map/index.md` mis à jour (3 `<Snippet source>` +
2 blocs de code illustratifs `title="...js"` → `.ts`/`.tsx`). Aucun `.eli5.json` sidecar, aucun
`readme.md` pour ce composant. Vérifié : `yarn lint && yarn format:check && yarn clear &&
yarn build` OK (SSR + prod build) — `build/map/index.html` contient bien la liste `GroupedList`
groupée par `mainTag` avec le bon compte d'articles et de liens ; rendu canvas (hover, clic,
meerkats) **confirmé fonctionnel par l'auteur sur `/map` le 2026-08-28**.

**`Blog/utils` migré le 2026-08-28** (7 fichiers, 301 lignes) : `color.ts`, `date.ts`,
`markdown.ts`, `posts.ts`, `related.ts`, `series.ts`, `slug.ts`. Les 3 `.d.ts` sidecars
(`posts.d.ts`, `related.d.ts`, `series.d.ts`) supprimés — types repris inline (`BlogPostMetadata`,
`BlogTag`, `SeriesListEntry`), même mécanisme que les sidecars `Card`/`Terminal` au niveau 4.
Piège spécifique à ce lot : `require.context()` est une extension Webpack, absente des types
Node (`@types/node`) et `@types/webpack-env` n'est pas installé — augmentation locale minimale
de `NodeJS.Require` ajoutée dans `src/global.d.ts` (un seul point d'appel, `posts.ts`). Découverte
en implémentant, pas anticipée au moment d'écrire ce TODO : `plugins/command-palette-plugin/
index.mjs` **importait directement** `Blog/utils/slug.js` (Node ESM natif, aucun loader TS
enregistré) — cassait dès le renommage en `.ts`, puisque Node ne sait pas exécuter du TypeScript
sans transpileur. Corrigé en dupliquant `createSlug()` dans le plugin, exactement le même motif
que `plugins/lib/blog-taxonomy.cjs` et `plugins/markdown-export-plugin/index.cjs` documentaient
déjà pour cette même fonction (eux pour CJS/ESM, ici pour JS/TS — même impossibilité de
traverser la frontière Node-brut ↔ code bundlé). 3 `.eli5.json` renommés (`posts`/`series`/
`slug`). Références mises à jour dans le même geste : 2 articles publiés
(`docusaurus-series`, `docusaurus-relatedposts` — `<Snippet source>` live + prose), 1 article
(`docusaurus-cards`) où seule la référence `<Snippet>` **live** (`slug.js`) a été mise à jour —
son autre `<Snippet source="./files/posts.js">` pointe vers un instantané figé propre à
l'article, laissé en JS (même précédent que `TypoReport`/`Reaction`, hors périmètre migration) ;
3 `readme.md`/`.md` de composants, `plugins/frontmatter-loader/readme.md`, et `CLAUDE.md`
lui-même (mentionnait `posts.js`). Vérifié dans le build de prod : `/series` (compteurs
`generateSeriesList`), une page série (`/series/claude-code`, hero + liens), `/blog/tags/docker`
(190 liens), `/blog/archive` (506 liens), `RelatedPosts` sur un article (liens corrects),
formatage de date (`formatPostDate`), glow de couleur (`hexToRgba` → `rgba(...)`), rendu
Markdown (`parseMarkdown` → `<strong>`), et les données du plugin `command-palette-plugin`
(251 articles, permalinks de série identiques à avant grâce au `createSlug` dupliqué) —
tous corrects.

**`CommandPalette` migré le 2026-08-28** (4 fichiers, 1088 lignes) : `index.tsx`, `Hint.tsx`,
`paletteBus.ts`, `utils.ts`. Types locaux (`NavIndex`/`NavArticle`/`NavSeries`/`NavTag`/`NavPage`,
`Entry`, `ResultItem`, `Group`, `ModeKey`) reflétant les deux plugins consommés
(`command-palette-plugin` et `questions-index-plugin`, tous deux `usePluginData()` → `unknown`,
même cast qu'ailleurs au niveau 5). Piège spécifique : `import("/pagefind/pagefind.js")` cible
un asset qui n'existe qu'à la build (substitué par les externals webpack de
`docusaurus-plugin-pagefind`) — `tsc` ne peut pas le résoudre, et un `declare module` ambiant
échoue pour tout spécificateur commençant par `/` (« Invalid module name in augmentation »,
vérifié empiriquement). Seul point du niveau 5 où un `any` explicite reste nécessaire : cast
`as any` sur le **spécificateur seul** (pas toute l'expression), commenté, sans `webpackIgnore`
pour ne pas casser la substitution des externals. Import avec extension `.js` explicite corrigé
dans `src/theme/SearchBar/index.js` (commentaire seulement) — aucun import réel cassé, `paletteBus`
et les autres imports depuis `src/theme/` étaient déjà sans extension. Aucun `.eli5.json`/`readme.md`
pour ce composant ; brouillon `.unpublished/docusaurus-command-palette/index.md` mis à jour
(4 `<Snippet source>` live + 2 blocs de code illustratifs). Vérifié dans le build de prod :
`.docusaurus/globalData.json` contient bien les 251 articles/séries/tags du plugin ; `yarn lint`
(0 erreur) `&& yarn format:check && yarn clear && yarn build` OK.

**`Bluesky` migré le 2026-08-28** (6 fichiers, 772 lignes) : `index.tsx`, `comments.tsx`,
`likes.tsx`, `post.tsx`, `share.tsx`, `useBlueskyEngagement.ts`. Sur demande explicite de
l'auteur malgré la mise en garde initiale (« attendre que `blueskyRecordKey` optionnel se
stabilise ») — aucune régression liée à cette évolution rencontrée. Types Bluesky (API publique,
non fournie par `@types/*`) centralisés dans `useBlueskyEngagement.ts` : `BlueskyActor`,
`BlueskyPostView`, `BlueskyEmbed` (union discriminée), `EngagementStats`, etc. **Piège
d'ordonnancement propre à ce composant** : `share.tsx` est référencé en direct (`<Snippet
source>`) par le **premier** article de la série, qui construit le composant *avant* que
`useBlueskyEngagement.ts` existe dans le récit du tutoriel — lui faire importer un type depuis ce
hook aurait cassé la cohérence pédagogique de l'article 1 pris isolément ; son `Props` est donc
déclaré en local plutôt qu'importé (seul fichier du composant dans ce cas). Piège TS : les
fonctions déclarées (`function fetchX() {}`) dans un `useEffect`, contrairement aux `const x =
async () => {}`, ne bénéficient pas du *narrowing* de fermeture sur une variable `const` gardée
juste avant — converti en arrow function pour éviter un `!` inutile (`comments.tsx`) ; même
piège absent des autres fichiers qui utilisaient déjà ce style. `alt` retiré des deux usages de
l'icône SVG (`post.tsx`, `share.tsx`) : `SVGProps` n'a pas cette prop, c'était un attribut DOM
mort avant même la migration (le `aria-label` du lien parent porte déjà le nom accessible). 6
`.eli5.json` renommés, `readme.md` mis à jour (2 mentions `useBlueskyEngagement.js`). Import avec
extension explicite corrigé dans `src/theme/BlogPostItem/index.js` (`Bluesky/index.js` →
`Bluesky`, hors périmètre migration mais aurait cassé le build). **Les deux articles publiés de
la série ont été retravaillés** (demande explicite de l'auteur, pas seulement les chemins) :
`docusaurus-bluesky-comments` (entièrement live-référencé, mise à jour mécanique des
`<Snippet>`/prose) et `docusaurus-bluesky-share` (mixte — `share.tsx` en direct, mais
`index.tsx` de cet article est un instantané figé propre au tutoriel : `./files/Bluesky.js`
renommé `./files/Bluesky.tsx` et réécrit en TSX pour rester cohérent avec « les nouveaux
composants s'écrivent en TypeScript », import corrigé dans `./files/BlogPostItem_3.js`, arbre
ASCII et prose mis à jour). Vérifié dans le build de prod : le bloc Bluesky rendu en SSR sur un
vrai article (`docusaurus-series`, lien `bsky.app` correct, SVG inline) ; les deux articles de la
série affichent les bons noms de fichiers `.tsx`/`.ts` ; `yarn lint` (0 erreur, 0 warning)
`&& yarn format:check && yarn clear && yarn build` OK.

| Fait | Composant | Fichiers | Lignes | Pourquoi en dernier |
| --- | --- | --- | --- | --- |
| [x] | `Blog/utils` | 7 | 301 | Plomberie centrale (`posts.js`, `require.context`) documentée comme sensible dans `CLAUDE.md` — « lire leurs commentaires avant de toucher ». Migré seul, avec revue attentive, pas en série avec d'autres composants. |
| [x] | `BlogGraph` | 3 | 807 | Pas de simulation D3 côté client (build-time only) — moins risqué que prévu ; risque réel était la géométrie canvas (hover/hit-test), inchangée par la migration. |
| [x] | `CommandPalette` | 4 | 1088 | Le plus gros composant du repo, navigation clavier + recherche. Testé via le build de prod (données du plugin) — pas de session manuelle exhaustive de tous les raccourcis, à confirmer par l'auteur. |
| [x] | `Bluesky` | 6 | 772 | En évolution active (`blueskyRecordKey` rendu optionnel le 2026-08-28, commit `209f5afa`) — migré quand même sur demande explicite ; aucune régression liée à cette évolution rencontrée. |

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

- [x] Niveau 1 entièrement migré et stable depuis au moins quelques jours en usage réel —
      confirmé par l'auteur le 2026-08-28 (plusieurs pages testées, tout fonctionnel)
- [x] Niveau 2 entièrement migré — `yarn lint && yarn format:check && yarn clear && yarn build`
      passent, 0 référence cassée (`yarn lint:snippets` : 1247 vérifiées, 0 manquante). Quelques
      tests manuels de l'auteur le 2026-08-28 semblent concluants. **Stabilité en usage réel sur
      plusieurs jours restant à confirmer** avant de le considérer aussi solide que le niveau 1
- [x] Niveau 3 entièrement migré — `yarn lint && yarn format:check && yarn lint:types &&
      yarn lint:snippets` passent, `yarn clear && yarn build` OK (65s), `yarn lint:snippets` :
      1247 vérifiées, 0 manquante. Vérifié dans le build de prod : pages tag/série (cartes +
      `heroStyle`), JSON-LD `StructuredData`, widget `Reaction`, `Trees` rendus correctement.
      **Stabilité en usage réel sur plusieurs jours restant à confirmer.**
- [x] Niveau 4 entièrement migré — `yarn lint` (0 erreur) `&& yarn format:check && yarn lint:types
      && yarn lint:snippets` (1247 vérifiées, 0 manquante) passent, `yarn clear && yarn build` OK
      (2 échecs build corrigés : imports `ProjectSetup/index.js` dans `MDXComponents.js` et
      `src/pages/project_setup.mdx`). Vérifié dans le build de prod : `Terminal`
      (ghost/cursor/typewriter), `Snippet` (42 blocs), `ProjectSetup`, `Card` (listings +
      `/repositories`), `Vars` (`varsbar` + résolution `%%marker%%`), `AskMyBlog` (`/faq`).
      **Stabilité en usage réel sur plusieurs jours restant à confirmer.**
- [x] `strict: true` activé dans `tsconfig.json` **avant** le niveau 5 — 47 erreurs corrigées
      sans `any`/`@ts-ignore` (4 `.d.ts` sidecars pour `Blog/utils` + `src/data/series.js`,
      détails dans « Contexte »). `yarn lint && yarn format:check && yarn clear && yarn build` OK
- [x] Niveau 5 traité en dernier, un par un, avec revue dédiée pour `Blog/utils` — désormais
      sous `strict`. Les 4 composants (`Blog/utils`, `BlogGraph`, `CommandPalette`, `Bluesky`)
      sont migrés (2026-08-28). **`CommandPalette` : pas de session manuelle exhaustive de tous
      les raccourcis clavier, à confirmer par l'auteur.**
- [x] Cette liste est tenue à jour (cocher/rayer au fur et à mesure) plutôt que remplacée par un
      nouveau TODO — à jour pour les 5 niveaux, migration terminée
- [x] `yarn lint && yarn format:check && yarn clear && yarn build` passent après chaque
      lot migré (tous niveaux) — le `yarn clear` a bien été fait à chaque fois
- [x] Avant chaque renommage (tous niveaux), les références dans `blog/`, `.unpublished/` et les
      `readme.md` de composants ont été cherchées et mises à jour dans le même geste. **Leçon
      niveau 4** : élargir le grep à `src/pages/**` et `**/*.mdx` — `tsc` n'y voit pas les
      imports avec extension `.js` explicite, seul le `yarn build` les attrape. **Leçon niveau 5**
      (`Blog/utils`, `Bluesky`) : un plugin/thème `.mjs`/`.js` qui **importe directement** un
      fichier de `src/components/` (Node ESM natif, sans loader TS) casse au renommage en `.ts`/
      `.tsx` même si le fichier lui-même est hors périmètre — grep systématiquement
      `plugins/**` et `src/theme/**` pour ce cas avant de renommer un fichier consommé ailleurs
      qu'en `.tsx`

## Bilan intermédiaire — niveaux 1 à 4 clôturés (2026-08-28)

47 composants migrés (17 + 20 + 8 + 9 fichiers-composants ; ~60 fichiers `.js`/`.jsx` au total
avec sidecars et sous-composants). Fondations posées en cours de route (toutes réutilisables pour
le niveau 5) : `src/global.d.ts` (images raster), règle ESLint `no-empty`/`allowEmptyCatch` côté
TS, suppression des `.d.ts` sidecars une fois le composant source migré, et le réflexe
« grep `index\.(js|jsx)"` sur `src` + `plugins` + `*.mdx` avant tout renommage ».

## Bilan final — niveau 5 et migration complète (2026-08-28)

Les 4 derniers composants migrés le même jour, sur trois passes successives (`BlogGraph` seul,
puis `Blog/utils` + `CommandPalette` + `Bluesky` sur demande explicite de tout traiter) :
`Blog/utils` (7 fichiers), `BlogGraph` (3), `CommandPalette` (4), `Bluesky` (6) — 20 fichiers,
3268 lignes. **Tous les composants de `src/components/` sont désormais `.ts`/`.tsx`.**

Fondations ajoutées au niveau 5, réutilisables au-delà de ce TODO :

- `src/global.d.ts` — augmentation locale de `NodeJS.Require` pour `require.context()`
  (extension Webpack absente de `@types/node`/`@types/webpack-env`, non installé) ; déclaration
  ambiante `/pagefind/pagefind.js` tentée puis abandonnée (TS rejette tout `declare module` dont
  le spécificateur commence par `/` — utiliser `as any` sur le spécificateur seul à la place,
  jamais sur toute l'expression, et jamais `webpackIgnore` si le build dépend d'une substitution
  externals à cet endroit).
- **Le seul `any` explicite de tout le niveau 5** (`CommandPalette/utils.ts`, import Pagefind
  dynamique) — documenté, ciblé sur un seul token, pas une régression de rigueur.
- Motif récurrent confirmé trois fois (`Blog/utils`→`command-palette-plugin`, `Bluesky`→
  `BlogPostItem/index.js`) : un fichier hors `src/components/` qui **importe directement** un
  fichier migré, sans passer par webpack/tsc (Node ESM/CJS natif dans un plugin, ou tout import
  avec extension `.js` explicite dans un thème swizzled) casse silencieusement au renommage.
  Ni `tsc` ni les niveaux 1-4 n'avaient de garde-fou pour ce cas précis — seul `yarn build`
  (jamais `tsc` seul) l'attrape, et seulement s'il y a un vrai import runtime à cet endroit (une
  simple mention en commentaire ne casse rien). Réflexe retenu : grep `plugins/**` et
  `src/theme/**` avant tout renommage d'un fichier `src/components/`, pas seulement `blog/`.
- Union discriminée sur un champ `$type: string` non littéral (`Bluesky/useBlueskyEngagement.ts`,
  API Bluesky) : l'égalité (`embed.$type === "..."`) ne rétrécit pas correctement un membre
  fourre-tout dont le discriminant est un `string` large — utiliser un narrowing par présence de
  propriété (`"external" in embed`) à la place.
- Une fonction déclarée (`function f() {}`) dans un `useEffect`, contrairement à une const
  fléchée (`const f = async () => {}`), ne bénéficie pas du *narrowing* de fermeture sur une
  variable `const` gardée juste avant — source d'un `!` non-null inutile si on ne le sait pas
  (`Bluesky/comments.tsx`).
- Deux articles publiés retravaillés en profondeur (pas seulement les chemins) parce que leur
  contenu enseigne activement la construction du composant migré, sur demande explicite de
  l'auteur : `docusaurus-bluesky-share` et `docusaurus-bluesky-comments` — voir le détail dans la
  section « Niveau 5 » ci-dessus. Un des deux a nécessité de réécrire un instantané de tutoriel
  figé (`./files/Bluesky.js` → `.tsx`) en plus des références `<Snippet>`, distinct des cas
  niveaux 1-4 où ces instantanés étaient laissés en JS (leçon : le distinguo dépend de si le
  tutoriel enseigne encore aujourd'hui la construction *initiale* du fichier renommé, pas juste
  s'il l'affiche).

**Reste ouvert, hors périmètre de ce TODO** (voir « Hors périmètre ») : `src/pages`, `src/theme`
(swizzled), `scripts/*.mjs`. Un TODO séparé existe déjà pour `docusaurus.config.js` → `.ts`
(0108) ; rien d'équivalent pour `src/theme`/`src/pages` à ce jour.

## Rattrapage — `TriedIt` échappé à l'inventaire (2026-08-28)

Après clôture du niveau 5, un inventaire de contrôle (`find src/components -name "*.js" -o -name
"*.jsx"`) a trouvé `src/components/TriedIt/index.js` (105 lignes) — absent des 5 niveaux
ci-dessus. Commit `4d51203b` (« wip: lot of UX changes ») l'a ajouté au repo **après** que
l'inventaire de ce TODO ait été écrit ; personne ne l'avait rattrapé depuis. Migré en `.tsx` sur
le même modèle que `Reaction` (niveau 3, même forme exacte : `localStorage` + fetch + vote) —
`Props`/`Counts` en interfaces locales, sinon zéro changement de logique. Brouillon
`.unpublished/tried_it/index.md` mis à jour (2 `<Snippet source>` live + 3 blocs de code
illustratifs + prose). Aucun `.eli5.json`/`readme.md` pour ce composant. Vérifié : `yarn lint`
(0 erreur) `&& yarn format:check && yarn clear && yarn build` OK ; markup du widget présent dans
le HTML de prod d'un article tutoriel.

**Contrôle final** : `find src/components -type f | grep -vE
"\.(tsx|ts|css|json|md|svg|png|webp|jpg|jpeg|gif|ico)$"` ne retourne plus que
`Blog/LogoIcon/iconBundle.generated.js` — fichier généré (`yarn icons:bundle`), jamais édité à la
main, légitimement hors périmètre. **`src/components/` est désormais 100 % TypeScript pour tout
code source écrit à la main.**

## Rattrapage — audit corpus-wide des articles décrivant des composants (2026-08-28)

Demande de l'auteur après la clôture ci-dessus : les articles (`blog/` + `.unpublished/`) qui
documentent un composant via `<Snippet source="src/components/...">` sont censés parler de la
version actuelle du fichier — tous rédigés à l'époque où les composants étaient encore en `.js`.
Recherche méthode : `grep -rln 'src/components/[A-Za-z0-9_/]*\.\(js\|jsx\)' blog .unpublished`.

**8 fichiers trouvés, tous corrigés sauf 1 (non pertinent) :**

- `blog/2025/08/21/docusaurus-override-img/index.md` — instantané local `./files/index.js`
  (composant `Image`, niveau 1) jamais mis à jour ni au moment de sa propre migration ni depuis
  — renommé `.tsx` et réécrit avec les types du vrai `Image/index.tsx`.
- `blog/2025/09/08/docusaurus-cards/index.mdx` — 3 instantanés locaux (`PostCard`,
  `TagArticlesPage`, `posts.js`) laissés délibérément en JS lors de la migration `Blog/utils`
  (motif « instantané pédagogique figé », même précédent que `TypoReport`/`Reaction`) —
  **précédent revu** après cette demande plus large de l'auteur : les 3 réécrits en `.tsx`/`.ts`,
  fidèles à leur propre portée (version simplifiée du tutoriel, pas la version enrichie réelle).
- `blog/2025/09/24/docusaurus-snippets/index.md` — un exemple hypothétique (« Let's imagine
  this ») pointait vers un chemin qui n'a jamais existé (`Blog/Snippet` au lieu de `Snippet`) ;
  corrigé pour coller au vrai composant déjà démontré plus haut dans le même article.
- `.unpublished/docusaurus-ask-my-blog-bubble/index.md` — 2 blocs de code illustratifs
  (`paletteBus.js`, `Hint.js`) — extension/langage mis à jour.
- `.unpublished/docusaurus-ask-my-blog/files/search_demo.txt` — commande `node` de démo
  important `AskMyBlog/utils.js` — chemin corrigé en `.ts` (la commande telle quelle nécessiterait
  déjà un runner TS, hors scope de cette passe : brouillon non publié, pas de correctif du
  `node -e` lui-même).
- `.unpublished/typo-report-docusaurus/index.md` — cas le plus lourd : un bloc de code unique de
  ~250 lignes (JS + PropTypes, jamais un `<Snippet>` live) recopiant `TypoReport` à la main,
  **déjà désynchronisé du composant réel avant même cette migration** (explicitement noté « hors
  périmètre » lors du niveau 4). Sur confirmation explicite de l'auteur (question posée), remplacé
  intégralement par le contenu actuel de `TypoReport/index.tsx` (324 lignes) plutôt qu'un simple
  changement d'extension — la section « Full implementation » de l'article promet justement le
  fichier complet et à jour. Une 4ᵉ note ajoutée à la liste « things worth noting » existante pour
  expliquer le seul changement de motif réellement nouveau (fonction fléchée `const` au lieu de
  `function` déclarée, pour le *narrowing* de fermeture TS).
- `.unpublished/ai-explain/index.md` + `files/example-error.txt` — **non modifiés** :
  `ProductList.jsx` est un exemple fictif pour illustrer un scénario « l'IA explique une erreur »,
  ce composant n'existe pas dans ce repo.

**Audit complémentaire des `readme.md` de composants** (`grep -E '\.jsx?\b'` sur tous les
`src/components/**/readme.md`, filtré des mentions légitimes `src/theme/*`/`src/data/*`/
`docusaurus.config.js`) — 7 fichiers corrigés, aucun trouvé lors des niveaux 1-4 eux-mêmes :

- `KonamiEasterEgg/readme.md`, `Blog/SeriesCards/readme.md`, `Blog/Updated/readme.md` —
  mentionnaient encore `index.js`/`index.jsx` pour des composants déjà migrés (niveaux 2-3).
- `ProjectSetup/readme.md` — le chemin d'exemple générique (`MyNewComponent/index.js`) mis à jour
  pour enseigner la convention actuelle.
- `MyRepositories/readme.md`, `Blog/SeriesPosts/readme.md`, `Blog/RelatedPosts/readme.md` —
  chemin **déjà faux avant la migration TS** (ancienne convention `Dossier/NomDossier.js` au lieu
  de `Dossier/index.*`, jamais mis à jour lors d'une réorganisation antérieure) — corrigés en même
  temps (chemin **et** extension).

**Leçon retenue** : la vérification « grep les articles avant renommage », systématique à partir
du niveau 2, ne couvre que les renommages faits *pendant* ce TODO — elle ne rattrape pas les
articles écrits *avant* le niveau 1 (avant même que la discipline existe) ni les `readme.md` que
personne n'a de raison de rouvrir après leur propre migration. Un futur nettoyage similaire devrait
inclure ce grep corpus-wide (`blog/`, `.unpublished/`, **et** tous les `readme.md`) comme étape
zéro, pas comme rattrapage après coup.

Vérifié : `yarn lint` (0 erreur, 0 warning) + `yarn format:check` + `yarn clear && yarn build` OK ;
`docusaurus-override-img` et `docusaurus-cards` vérifiés dans le HTML de build (bons noms de
fichiers, 0 mention `.js` résiduelle).
