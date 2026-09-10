# 0115 — Afficher la `description` en chapeau sous le titre de l'article

- **Priority**: High — quick win sur les 255 articles, aucun contenu à migrer
- **Batch**: blog-article-header
- **Depends**: —
- **Files**: `src/theme/BlogPostItem/Header/index.js`, `src/theme/BlogPostItem/Header/styles.module.css` (à créer)

## Problème

Constat fait en comparant avec [actuia.com](https://www.actuia.com/), qui affiche systématiquement
une phrase de contexte en gris juste sous le `<h1>`, avant l'image et avant le corps.

Chez nous, le champ `description:` du frontmatter est renseigné dans **255 articles sur 255**, mais
il n'est **jamais affiché au lecteur**. Vérifié : la seule lecture de `frontMatter.description` dans
tout `src/` est `src/components/Blog/utils/posts.ts:140`, qui alimente les cartes de listing. Sur la
page d'article, la description ne sert que de `<meta name="description">` et de balise Open Graph.

Conséquence concrète : un lecteur qui arrive de Google voit **titre → ligne date/temps de lecture →
image bannière pleine largeur → `<TLDR>`**. Le premier écran ne contient donc pas une seule ligne de
texte explicatif, alors qu'une phrase parfaitement calibrée existe déjà dans le fichier.

Le `<TLDR>` ne remplace pas ce chapeau : il fait typiquement 4 à 8 lignes, contient des liens et du
code inline, et arrive *après* la bannière. Ce sont deux objets différents — le chapeau répond à
« de quoi ça parle ? » en une phrase, le TLDR à « quelle est la réponse courte ? ».

## Solution

Rendre `metadata.description` dans `BlogPostItemHeader`, entre le titre et
`<BlogPostItemHeaderInfo>`, sous forme de `<p>` stylé (taille légèrement supérieure au corps,
couleur `--ifm-color-content-secondary`, pas d'italique).

Points d'attention :

- **Page article uniquement.** `BlogPostItemHeader` ne consomme pas encore `useBlogPost()` ; il faut
  l'ajouter pour récupérer `metadata` **et** `isBlogPostPage`. En vue liste, la description est déjà
  rendue par la carte — l'afficher deux fois serait une régression visuelle.
- **Docusaurus retombe sur un extrait automatique** quand `description` est absente du frontmatter.
  Ici les 255 articles l'ont, mais un futur article sans description afficherait les premiers mots du
  corps, ce qui serait moche. Comparer `metadata.description` à `frontMatter.description` et ne
  rendre le chapeau que si ce dernier existe.
- Ne pas dupliquer la description dans le flux RSS ni dans `StructuredData` — elle y est déjà.

## Risque

- **Redondance perçue avec le TLDR** si la description est une paraphrase du TLDR. C'est le vrai
  risque du chantier, et il est éditorial, pas technique : à vérifier visuellement sur une dizaine
  d'articles de familles différentes (un tuto Docker, un article Docusaurus meta, une astuce VSCode)
  avant de généraliser. Si la redondance saute aux yeux, l'issue n'est pas de renoncer mais de
  resserrer les descriptions concernées.
- **Hauteur du premier écran.** Ajouter un paragraphe repousse la bannière et le TLDR vers le bas.
  À contrôler sur mobile : le gain de sens doit dépasser le coût de scroll.

## Acceptance

- [ ] La `description` du frontmatter s'affiche sous le `<h1>` sur la page d'article
- [ ] Rien n'est ajouté en vue liste (`/blog`, tags, séries, archives) — vérifié visuellement
- [ ] Un article sans `description:` dans son frontmatter n'affiche aucun chapeau (pas d'extrait auto)
- [ ] Rendu contrôlé en thème clair **et** sombre, et sur une largeur mobile
- [ ] Revue visuelle sur au moins 5 articles de familles différentes pour valider l'absence de
      redondance avec le `<TLDR>`
- [ ] `yarn lint && yarn format:check && yarn build` passent
