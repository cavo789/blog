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
- [ ] Niveau 5 traité en dernier, un par un, avec revue dédiée pour `Blog/utils`
- [x] Cette liste est tenue à jour (cocher/rayer au fur et à mesure) plutôt que remplacée par un
      nouveau TODO — à jour pour les niveaux 1-4 ; ne reste que le niveau 5
- [x] `yarn lint && yarn format:check && yarn clear && yarn build` passent après chaque
      lot migré (niveaux 1-4) — le `yarn clear` a bien été fait à chaque fois
- [x] Avant chaque renommage (niveaux 1-4), les références dans `blog/`, `.unpublished/` et les
      `readme.md` de composants ont été cherchées et mises à jour dans le même geste. **Leçon
      niveau 4** : élargir le grep à `src/pages/**` et `**/*.mdx` — `tsc` n'y voit pas les
      imports avec extension `.js` explicite, seul le `yarn build` les attrape

## Bilan intermédiaire — niveaux 1 à 4 clôturés (2026-08-28)

47 composants migrés (17 + 20 + 8 + 9 fichiers-composants ; ~60 fichiers `.js`/`.jsx` au total
avec sidecars et sous-composants). Reste **uniquement le niveau 5** : `Blog/utils`, `BlogGraph`,
`CommandPalette`, `Bluesky`. Fondations posées en cours de route (toutes réutilisables pour le
niveau 5) : `src/global.d.ts` (images raster), règle ESLint `no-empty`/`allowEmptyCatch` côté
TS, suppression des `.d.ts` sidecars une fois le composant source migré, et le réflexe
« grep `index\.(js|jsx)"` sur `src` + `plugins` + `*.mdx` avant tout renommage ».
