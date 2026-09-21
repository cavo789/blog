# 0130 — Prévisualisation des drafts via une seconde instance du plugin blog

- **Priority**: Medium
- **Batch**: blog-playground
- **Depends**: —
- **Files**: `docusaurus.config.js`, `src/css/custom.css`

## Problème

Les articles dans `.unpublished/` sont invisibles de Docusaurus, même en dev. Il est impossible de visualiser le rendu final d'un draft sans le déplacer dans `blog/`, ce qui le mélange aux articles publiés et risque de polluer les listings, tags et séries.

## Solution

Ajouter une seconde instance du plugin `@docusaurus/plugin-content-blog` dans `docusaurus.config.js`, conditionnelle à `NODE_ENV !== 'production'`, pointant sur `.unpublished/`.

### Comportement attendu

- **En dev (`yarn start`)** : route `/drafts/<slug>` pour chaque article, listing `/drafts/`, lien "Drafts" dans la navbar
- **En prod (`yarn build`)** : plugin non instancié → aucune route `/drafts/`, aucun lien navbar, `.unpublished/` totalement ignoré
- **Isolation garantie** : les tags, séries, "articles suivants/précédents" et listings du blog principal ne voient rien

### Implémentation

```js
// docusaurus.config.js — dans le tableau plugins[]
...(process.env.NODE_ENV !== 'production' ? [
  [
    '@docusaurus/plugin-content-blog',
    {
      id: 'drafts',
      routeBasePath: 'drafts',
      path: '.unpublished',
      blogTitle: 'Drafts',
      blogDescription: 'Articles en cours de rédaction (dev uniquement)',
      showReadingTime: true,
      authorsMapFile: 'blog/authors.yml',
      tagsBasePath: 'drafts/tags',
    },
  ],
] : []),
```

```js
// navbar (themeConfig.navbar.items[]) — conditionnel
...(process.env.NODE_ENV !== 'production' ? [
  { to: '/drafts', label: 'Drafts', position: 'left' },
] : []),
```

## Risques / points d'attention

- Les tags utilisés dans `.unpublished/` n'ont pas besoin d'exister dans `blog/tags.yml` (instance séparée → pas de validation croisée). À vérifier.
- Le plugin `frontmatter-loader` (`plugins/frontmatter-loader/`) gère `draft: true` pour le blog principal ; les articles `.unpublished/` ont déjà `draft: true` en frontmatter — vérifier que le second plugin ne filtre pas ces articles en dev (il ne devrait pas : `draft: true` est filtré par le plugin principal uniquement en prod).
- Vérifier que `yarn build` (CI inclus) passe bien sans aucune trace de la route `/drafts/`.
- Le lien navbar "Drafts" ne doit pas apparaître dans le rendu statique ni dans le sitemap.
