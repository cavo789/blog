---
slug: docusaurus-changelog
title: Afficher le changelog de votre article
date: 2025-11-18
description: Afficher le changelog de votre article
authors: [christophe]
image: /img/v2/changelog.webp
mainTag: docusaurus
series: Creating Docusaurus components
tags:
  - component
  - docusaurus
  - react
language: fr
review_date: 2026-07-30
blueskyRecordKey: 3m5vewhxkok2k
---
![Afficher le changelog de votre article](/img/v2/changelog.webp)

<TLDR>
Cet article montre comment mettre en place un changelog détaillé pour les articles de blog Docusaurus, au-delà du champ `last_update` par défaut. Il s'agit de créer un composant React personnalisé qui lit un tableau `updates` depuis le frontmatter YAML de l'article, ce qui permet d'avoir plusieurs notes datées. La solution demande de créer ce composant puis de swizzler le thème `BlogPostItem/Content` pour afficher automatiquement l'historique des mises à jour.
</TLDR>


En tant qu'auteur de blog, il vous arrive forcément de retoucher d'anciens articles pour ajouter ou clarifier un passage. Ou simplement pour supprimer une information obsolète.

Docusaurus propose l'entrée `last_update` ([source](https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-content-docs#last_update)) comme illustré ci-dessous, mais vous ne pouvez indiquer qu'une seule date, sans description.

```yaml
last_update:
  date: 1/1/2000
  author: custom author name
```

Créons un tout petit composant pour améliorer ça.

<!-- truncate -->

## Le résultat {#the-result}

Une fois le composant branché (voir plus bas), il suffit d'ajouter une entrée `updates` dans le frontmatter d'un article pour obtenir ceci, automatiquement :

![Demo](./images/sample.webp)

## Pourquoi ça marche {#why-it-works}

- Le composant lit un tableau `updates` directement dans le frontmatter YAML de l'article — aucun fichier de changelog séparé à maintenir.
- Contrairement au `last_update` natif de Docusaurus, il accepte plusieurs entrées, chacune avec sa propre `date` et sa `note`.
- Une fois swizzlé, il s'affiche automatiquement sur chaque article qui contient une entrée `updates` — rien à appeler manuellement article par article.

## Installation {#installation}

Nous allons devoir créer un nouveau composant et swizzler le BlogPostPage, afin que le composant soit exécuté automatiquement.

### Créer le composant Updated {#create-the-updated-component}

Créez un nouveau dossier `src/components/Blog/Updated` dans lequel vous allez créer deux fichiers : `index.tsx` et `styles.module.css`.

<Snippet filename="src/components/Blog/Updated/index.tsx" source="src/components/Blog/Updated/index.tsx" />

<Snippet filename="src/components/Blog/Updated/styles.module.css" source="src/components/Blog/Updated/styles.module.css" />

En résumé, le composant vérifie si le frontmatter YAML de votre article de blog contient une entrée `updates`. Si c'est le cas, il la lit. Ce doit être un tableau avec deux informations : une `date` et une `note`.

### Surcharger le template BlogPostPage {#override-the-blogpostpage-template}

Vérifiez d'abord si vous n'avez pas déjà le fichier `src/theme/BlogPostItem/Content/index.js`. Si vous êtes un lecteur de ce blog et que vous avez déjà personnalisé Docusaurus, vous l'avez peut-être déjà : <Link to="/blog/docusaurus-old-notice">le composant qui signale qu'un article a plus d'un an</Link> swizzle exactement ce même fichier.

Sinon, ouvrez une console et lancez `yarn swizzle @docusaurus/theme-classic BlogPostItem/Content`.

À partir de maintenant, vous avez un nouveau fichier sur votre disque : `src/theme/BlogPostItem/Content/index.js`.

Nous devons injecter notre nouveau composant `Updated`, éditez le fichier `index.js` pour y insérer le code nécessaire.

Voici les lignes minimales à ajouter au bon endroit dans votre propre fichier.

<Snippet filename="src/theme/BlogPostItem/Content/index.js" source="./files/index.js" />

## Autres démos {#more-demos}

### Utiliser le composant {#use-the-component}

Éditez maintenant n'importe lequel de vos articles existants et ajoutez une entrée `updates` dans votre frontmatter YAML, par exemple

```yaml
updates:
  - date: 2024-11-19
    note: review Dockerfile, use Quarto 1.6.36.
  - date: 2024-12-01
    note: Added new theme options for blog posts.
  - date: 2024-12-15
    note: Fixed bug with image rendering on mobile devices.
  - date: 2025-01-05
    note: Implemented search functionality for documentation pages.
  - date: 2025-01-20
    note: Optimized build process for faster deployment times.
```

Enregistrez l'article et rafraîchissez votre page web. Si tout est correct, vous verrez l'information dans votre navigateur — le même rendu que celui présenté en haut de cet article.

N'hésitez pas à modifier `src/components/Blog/Updated/styles.module.css` pour coller à vos propres préférences de style.

## Conclusion {#conclusion}

Un petit tableau lu dans le frontmatter et un seul fichier de thème swizzlé remplacent la date unique de `last_update` par un vrai changelog à plusieurs entrées — les lecteurs voient exactement ce qui a changé et quand, sans que vous ayez à maintenir un fichier séparé.

Ça se marie bien avec <Link to="/blog/docusaurus-old-notice">l'avertissement affiché sur les articles de plus d'un an</Link> : le premier dit *ce qui* a changé, le second dit *quand* c'est arrivé pour la dernière fois.
