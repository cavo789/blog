---
slug: docusaurus-ai-gemini
title: Comment signaler un contenu assisté par IA dans un blog Docusaurus
description: Un guide pas à pas pour indiquer qu'un article a été écrit avec l'aide d'une IA comme Google Gemini, en ajoutant une icône et un auteur.
image: /img/v2/gemini-co-author.webp
series: Creating Docusaurus components
mainTag: docusaurus
tags:
  - ai
  - docusaurus
authors: [christophe]
ai_assisted: true
date: 2026-03-09
blueskyRecordKey: 3mgmbqloqk222
---

![Comment signaler un contenu assisté par IA dans un blog Docusaurus](/img/v2/gemini-co-author.webp)

<TLDR>
Cet article explique comment signaler un contenu assisté par IA dans un blog Docusaurus, en ajoutant une icône et un co-auteur.
</TLDR>

À l'heure des assistants IA puissants comme Google Gemini, il devient de plus en plus courant de les utiliser pour créer du contenu, brainstormer ou même coder. En tant que créateur de contenu, je crois à la transparence envers mon audience. Si une IA a contribué de manière significative à un contenu, le lecteur doit le savoir.

*Deux cas concrets où je m'appuie sur une IA et où je lève donc ce drapeau : <Link to="/blog/gemini-tldr">Automating TL;DR Summaries with Gemini AI</Link> et <Link to="/blog/docusaurus-eli5-snippet-tooltips">AI-Powered Code Tooltips in Docusaurus</Link>.*

Cet article est un guide pas à pas de la façon dont j'ai implémenté un indicateur « AI Assisted » dans mon blog Docusaurus. Quand j'ajoute `ai_assisted: true` au front matter YAML d'un article, deux choses se produisent automatiquement :

1. Une petite icône « AI Assisted » apparaît à côté de la date et du temps de lecture de l'article.
2. « Google Gemini » est ajouté comme co-auteur.

Voici comment faire la même chose sur votre propre blog.

<!-- truncate -->

<QuickJump
  links={[
    { label: "Voir le résultat", to: "#the-result" },
    { label: "Étape 2 : créer le composant AIIcon", to: "#step-2-creating-the-aiicon-component" },
  ]}
/>

## Le résultat {#the-result}

Voici ce que produit un simple flag `ai_assisted: true`, rendu sur un vrai article de ce blog :

![Le badge « AI Assisted » et le co-auteur Google Gemini, rendus dans l'en-tête d'un vrai article](./images/ai_assisted_badge.png)

L'icône se place juste à côté de la date et du temps de lecture, et l'IA apparaît comme un véritable co-auteur aux côtés de l'auteur humain — rien de caché, rien à cliquer pour le découvrir.

## Pourquoi faire ça {#why-do-this}

En tant que créateur de contenu, je crois à la transparence envers mon audience. Si une IA a contribué de manière significative à un contenu, le lecteur doit le savoir — pas enterré dans un pied de page, pas omis, mais là, dans l'en-tête, où la date et le temps de lecture se trouvent déjà. Un seul flag dans le front matter pilote à la fois l'icône et le co-auteur : pas d'étape séparée à oublier.

## Étape 1 : le front matter `ai_assisted` {#step-1-the-ai_assisted-front-matter}

Tout le processus est piloté par un seul flag dans le front matter de vos articles. C'est la partie la plus simple : ajoutez juste `ai_assisted: true` à chaque article pour lequel une IA vous a aidé.

<Snippet filename="your-post.md" source="./files/your-post.txt" defaultOpen={true} />

Ce flag sera le déclencheur de toute la logique que nous allons construire ensuite.

## Étape 2 : créer le composant `AIIcon` {#step-2-creating-the-aiicon-component}

Commençons par créer le composant visuel de notre indicateur. C'est un simple composant React qui affiche une icône et le texte « AI Assisted ».

<ProjectSetup folderName="src/components/Blog/AIIcon" createFolder={true} >
  <Snippet filename="src/components/Blog/AIIcon/index.tsx" source="src/components/Blog/AIIcon/index.tsx" defaultOpen={false} />
  <Snippet filename="src/components/Blog/AIIcon/index.module.css" source="src/components/Blog/AIIcon/index.module.css" defaultOpen={false} />
</ProjectSetup>

## Étape 3 : afficher l'icône grâce au swizzling {#step-3-displaying-the-icon-with-swizzling}

Il faut maintenant faire apparaître ce composant dans l'en-tête de nos articles. Pour cela, nous devons modifier certains composants du thème de base de Docusaurus. C'est là que le **swizzling** entre en jeu. Le swizzling est une fonctionnalité de Docusaurus qui permet de remplacer un composant du thème par votre propre version personnalisée.

Dans cette implémentation, la logique est répartie entre trois composants : `BlogPostItem`, son `Header`, et la section `Info` à l'intérieur de l'en-tête. Nous devrons swizzler les trois.

Lancez les commandes suivantes dans votre terminal :

<Terminal typewriter wrap={true} source="./files/terminal-1.txt" />

Cela va copier les fichiers originaux du thème dans votre répertoire `src/theme`, prêts à être édités.

### 3.1. Modifier `src/theme/BlogPostItem/index.js` {#31-modify-srcthemeblogpostitemindexjs}

Ici, nous allons importer notre nouveau `AIIcon` et décider s'il doit être affiché en fonction du front matter.

```javascript title="src/theme/BlogPostItem/index.js" {1,9,12}
import AIIcon from "@site/src/components/Blog/AIIcon";
import { useBlogPost } from "@docusaurus/plugin-content-blog/client";
import BlogPostItemContainer from "@theme/BlogPostItem/Container";
import BlogPostItemContent from "@theme/BlogPostItem/Content";
import BlogPostItemFooter from "@theme/BlogPostItem/Footer";
import BlogPostItemHeader from "@theme/BlogPostItem/Header";

export default function BlogPostItem({ children, className }) {
  const { metadata, isBlogPostPage } = useBlogPost();
  const { frontMatter } = metadata;
  const containerClassName = useContainerClassName();
  const aiIcon = frontMatter.ai_assisted && isBlogPostPage ? <AIIcon /> : null;

  return (
    <BlogPostItemContainer className={clsx(containerClassName, className)}>
      <BlogPostItemHeader aiIcon={aiIcon} />
      <BlogPostItemContent>{children}</BlogPostItemContent>
      <BlogPostItemFooter />
    </BlogPostItemContainer>
  );
}
```

### 3.2. Modifier `src/theme/BlogPostItem/Header/index.js` {#32-modify-srcthemeblogpostitemheaderindexjs}

Ce composant a juste besoin d'accepter la prop `aiIcon` et de la transmettre à son enfant.

```javascript title="src/theme/BlogPostItem/Header/index.js" {6,10}
import React from 'react';
import BlogPostItemHeaderTitle from '@theme/BlogPostItem/Header/Title';
import BlogPostItemHeaderInfo from '@theme/BlogPostItem/Header/Info';
import BlogPostItemHeaderAuthors from '@theme/BlogPostItem/Header/Authors';

// Add aiIcon to the function signature
export default function BlogPostItemHeader({aiIcon}) {
  return (
    <header>
      <BlogPostItemHeaderTitle />
      <BlogPostItemHeaderInfo aiIcon={aiIcon} />
      <BlogPostItemHeaderAuthors />
    </header>
  );
}
```

### 3.3. Modifier `src/theme/BlogPostItem/Header/Info/index.js` {#33-modify-srcthemeblogpostitemheaderinfoindexjs}

Enfin, ce composant reçoit la prop et l'affiche.

```javascript title="src/theme/BlogPostItem/Header/Info/index.js" {11,24-25}
import React from "react";
import clsx from "clsx";
import { translate } from "@docusaurus/Translate";
// ... other imports

function Spacer() {
  return <>{" · "}</>;
}

export default function BlogPostItemHeaderInfo({ className, aiIcon }) {
  const { metadata } = useBlogPost();
  const { date, readingTime } = metadata;
  // ... other code

  return (
    <div className={clsx(styles.container, "margin-vert--md", className)}>
      <DateTime date={date} formattedDate={formatDate(date)} />
      {typeof readingTime !== "undefined" && (
        <>
          <Spacer />
          <ReadingTime readingTime={readingTime} />
        </>
      )}
      {aiIcon && <Spacer />}
      {aiIcon}
    </div>
  );
}
```

Avec ces modifications, l'icône « AI Assisted » apparaîtra désormais sur tout article de blog dont le front matter est correct.

## Étape 4 : ajouter « Google Gemini » comme auteur {#step-4-adding-google-gemini-as-an-author}

Comme pour l'icône, nous pouvons ajouter automatiquement un auteur.

### 4.1. Définir l'auteur IA {#41-define-the-ai-author}

D'abord, définissez votre auteur IA dans `blog/authors.yml`.

<Snippet filename="blog/authors.yml" source="./files/authors.txt" defaultOpen={true} />

### 4.2. Swizzler le composant Authors {#42-swizzle-the-authors-component}

Nous devons swizzler un composant de plus pour injecter la logique d'auteur.

<Terminal typewriter wrap={true}>
$ yarn run swizzle @docusaurus/theme-classic BlogPostItem/Header/Authors
</Terminal>

### 4.3. Modifier `src/theme/BlogPostItem/Header/Authors/index.js` {#43-modify-srcthemeblogpostitemheaderauthorsindexjs}

Éditez maintenant le fichier fraîchement créé pour y ajouter la logique. Nous lisons le flag `ai_assisted` depuis le front matter et, s'il est à true, nous ajoutons notre objet auteur « Gemini » à la liste des auteurs.

```javascript title="src/theme/BlogPostItem/Header/Authors/index.js" {14-24}
import React from "react";
import clsx from "clsx";
import { useBlogPost } from "@docusaurus/plugin-content-blog/client";
import BlogAuthor from "@theme/Blog/Components/Author";
import styles from "./styles.module.css";

export default function BlogPostItemHeaderAuthors({ className }) {
  const {
    metadata: { authors },
    frontMatter,
    assets,
  } = useBlogPost();

  const allAuthors = [...authors];

  if (frontMatter.ai_assisted) {
    const geminiAuthor = {
      name: "Google Gemini",
      title: "AI Assistant",
      url: "https://gemini.google.com/",
      imageURL: "/img/gemini-logo.webp",
    };
    if (!allAuthors.find((a) => a.name === geminiAuthor.name)) {
      allAuthors.push(geminiAuthor);
    }
  }

  const authorsCount = allAuthors.length;
  // ... rest of the component
```

## Conclusion {#conclusion}

Voilà, c'est tout ! Avec quelques personnalisations de composants, vous disposez maintenant d'un système solide pour signaler de façon transparente l'assistance d'une IA dans votre blog. Cette approche garde vos fichiers Markdown propres (un seul flag à ajouter) et centralise la logique dans votre thème Docusaurus, ce qui la rend facile à maintenir et à faire évoluer. En étant ouvert sur votre processus, vous gagnez la confiance de votre audience.

Ce flag `ai_assisted`, vous le verrez sur d'autres articles où l'IA a joué un vrai rôle, comme <Link to="/blog/gemini-meerkat">How I used Google Gemini Nano Banana on my blog</Link> (la génération de toutes mes images de bannière) ou <Link to="/blog/lovable-dev-ai">Lovable.dev</Link> (un constructeur d'applications piloté par IA) — l'article même dont la capture d'écran ci-dessus est tirée.
