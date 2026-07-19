# 056 — PropTypes manquants dans src/theme (suite de codelint)

**Priority:** Medium

## Contexte

Session du 2026-07-09 lancée sur "corrige les warnings de codelint" (`yarn lint` = `eslint .` +
`stylelint`). Parti de **472 warnings** (131 JS + 341 CSS), ramené à **53 warnings** (0 CSS, 53 JS
— tous `react/prop-types`), **0 erreur**. Session interrompue proprement (extinction machine) avant
la fin — ce TODO couvre exactement ce qui reste.

## Déjà fait dans cette session (ne pas refaire)

- CSS : 341 → 0 warnings (color-no-hex déjà traité via [[DONE_039]] en amont ; le reste —
  `no-descending-specificity`, `no-duplicate-selectors`, `declaration-block-no-shorthand-property-overrides`,
  mot-clé déprécié `word-break: break-word` — corrigé dans cette session).
- [[DONE_048]] (bug de bordure AlertBox) implémenté et clos au passage.
- JS : `no-unused-vars` (12), `react/no-unescaped-entities` (12), directives
  `eslint-disable` mortes (3), `react-hooks/exhaustive-deps` (1, `GithubProjects/index.js`),
  `react-hooks/set-state-in-effect` (12 — lazy-init/`useMemo` quand pertinent, sinon
  `eslint-disable-next-line` documenté pour les cas légitimes SSR/hydration ou de synchronisation
  réactive) : tous à 0.
- `react/prop-types` déjà traité pour `src/pages/admin.js`, `src/pages/reactions-dashboard.js`,
  `src/pages/typo-dashboard.js` (tous leurs sous-composants ont maintenant un bloc `.propTypes`).
- `eslint.config.js` : ajout de `ignoreRestSiblings: true` à `no-unused-vars` (pattern légitime de
  déstructuration pour exclure des props avant un spread `...rest`, vu dans
  `src/theme/MDXComponents.js`).

## Ce qui reste — 53 warnings `react/prop-types`, 12 fichiers, tous dans `src/theme/`

Lancer `yarn lint:js` pour la liste exacte à jour (les numéros de ligne peuvent avoir légèrement
bougé si d'autres changements sont intervenus entre-temps). État au moment de l'interruption :

1. `src/theme/Blog/Components/Author/Socials/index.js` — `platform`, `link`, `author`,
   `author.socials` (4 warnings).
2. `src/theme/Blog/Components/Author/index.js` — le plus gros : `href`, `children`, `title`,
   `name`, `as`, `count`, `author` (shape complet : `name`, `title`, `url`, `imageURL`, `email`,
   `page.permalink`), `className` (17 warnings — probablement 2-3 sous-composants dans le même
   fichier, lire avant d'écrire les propTypes).
3. `src/theme/BlogListPage/index.js` — `metadata` (shape : `blogDescription`, `blogTitle`,
   `totalCount`), `items` (array) (7 warnings).
4. `src/theme/BlogPostItem/Content/index.js` — `children` (1 warning).
5. `src/theme/BlogPostItem/Header/Authors/index.js` — `className` (1 warning).
6. `src/theme/BlogPostItem/Header/Info/index.js` — `readingTime`, `date`, `formattedDate`,
   `mainTag`, `tags` (array), `className`, `aiIcon` (9 warnings).
7. `src/theme/BlogPostItem/Header/index.js` — `aiIcon` (1 warning).
8. `src/theme/BlogPostItem/index.js` — `children`, `className` (2 warnings).
9. `src/theme/BlogPostPage/index.js` — `sidebar`, `children`, `content` (×2, probablement 2
   sous-composants), `BlogPostContent` (6 warnings).
10. `src/theme/BlogTagsListPage/index.js` — `tags`, `sidebar` (2 warnings — la fonction a déjà un
    commentaire `// eslint-disable-next-line no-unused-vars` sur `sidebar`, le garder).
11. `src/theme/Root.js` — `children` (1 warning).
12. `src/theme/TagsListInline/index.js` — `tags` (array) (2 warnings).

## Méthode (celle utilisée dans cette session, à reproduire)

Pour chaque fichier :

1. Lire le fichier en entier pour comprendre la forme réelle des props utilisées (pas juste le nom
   — regarder comment chaque prop est consommée pour choisir le bon type `PropTypes.*`).
2. Ajouter `import PropTypes from "prop-types";` si absent.
3. Ajouter un bloc `NomDuComposant.propTypes = { ... }` juste après chaque fonction composant,
   avec `.isRequired` seulement si le composant plante réellement sans la prop (pas par défaut
   systématique).
4. Pour les props `children`, `tags`, `items` : utiliser `PropTypes.node`, `PropTypes.array` (ou
   `PropTypes.arrayOf(PropTypes.shape({...}))` si la forme des éléments est exploitée dans le
   fichier — voir comment `TypeBadge`/`ReportCard` dans `typo-dashboard.js` ont été typés dans
   cette session comme référence de style).
5. Après chaque fichier : `npx eslint <fichier>` pour vérifier 0 warning avant de passer au
   suivant — ne pas attendre la fin pour tout vérifier d'un coup.
6. Ces fichiers sont des composants **thème Docusaurus swizzlés** (wrapping/override de composants
   du thème officiel) — certaines props (ex. `sidebar` dans `BlogTagsListPage`/`BlogPostPage`) font
   partie du contrat d'API imposé par Docusaurus même si le composant local ne les utilise pas
   toutes ; ne pas les supprimer, juste les typer (`PropTypes.object` généralement suffisant pour
   un objet dont la forme n'est pas exploitée localement).

## Vérification finale

```bash
yarn lint   # doit passer à 0 erreur, 0 warning (actuellement 53 restants, tous ici)
yarn build  # doit rester vert
```

## Lien avec l'existant

Suite directe de [[PARTIAL_036]] (qui avait explicitement laissé `react/prop-types` en `warn` et
différé la couverture de `src/theme`, ~70+ occurrences à l'époque — le chiffre exact a un peu
bougé depuis). Ne pas repasser `react/prop-types` en `"error"` avant que ce TODO soit clos (sinon
`yarn lint` échouera immédiatement sur les fichiers restants).
