---
slug: docusaurus-articles-tips
title: Quelques trucs et astuces pour écrire des articles Docusaurus
date: 2024-02-07
description: Boostez vos articles Docusaurus avec quelques astuces essentielles. Apprenez à ajouter des Admonitions, à appliquer du style inline et à mettre en évidence des lignes de code.
authors: [christophe]
image: /img/v2/docusaurus_tips.webp
series: Discovering Docusaurus
mainTag: docusaurus
tags:
  - docusaurus
  - markdown
language: fr
updates:
  - date: 2025-09-13
    note: Add Highlight component
blueskyRecordKey: 3lyqe2y7uvc2a
---
![Quelques trucs et astuces pour écrire des articles Docusaurus](/img/v2/docusaurus_tips.webp)

<TLDR>
Cet article est un pense-bête des fonctionnalités d'écriture essentielles de Docusaurus : le marqueur `truncate` pour les aperçus d'articles de blog, les admonitions pour les encadrés, le style inline avec `<span>`, un composant `Highlight` personnalisé pour du texte coloré, et `// highlight-next-line` pour attirer l'attention sur les lignes modifiées dans un bloc de code.
</TLDR>

Si vous écrivez pour Docusaurus, il y a quelques astuces à connaître.

Cet article est loin d'être exhaustif mais, pour moi, c'est un rappel des fonctionnalités vraiment essentielles à ne pas oublier. *Deux autres habitudes d'écriture à adopter tôt : garder vos <Link to="/blog/docusaurus-tags">tags sous contrôle</Link> et <Link to="/blog/docusaurus-relatedposts">afficher les articles liés</Link> sous chaque article.*

<!-- truncate -->

## Lire la suite {#read-more}

[Documentation officielle](https://docusaurus.io/docs/blog#blog-list)

En mode blog, votre article est divisé en deux parties : l'introduction avec un lien *Lire la suite*, puis le corps de l'article.

Pour activer cette fonctionnalité, il suffit d'ajouter la ligne `<!-- truncate -->` (précédée et suivie d'une ligne vide) là où vous souhaitez séparer l'introduction du corps.

Si vous allez sur ma page [blog](/blog), chaque article a une introduction suivie d'une ligne `<!-- truncate -->` dans ma source Markdown.

## Admonitions {#admonitions}

[Documentation officielle](https://docusaurus.io/docs/markdown-features/admonitions)

Sert à mettre en évidence un paragraphe de votre document, par exemple un encadré *Attention à...* ou *Astuce : saviez-vous que...*.

```markdown
<AlertBox variant="caution" title="Pay attention to...">
Never give your bank card code to a stranger.

</AlertBox>
```

Sera affiché par Docusaurus comme ceci :

<AlertBox variant="caution" title="Attention à...">
Ne donnez jamais le code de votre carte bancaire à un inconnu.

</AlertBox>

## Style inline {#inline-style}

Docusaurus supporte le style inline grâce à la notation `<span> ... </span>`.

La notation `<span style={{color: 'blue'}}>I'm written in blue</span>` donnera <span style={{color: 'blue'}}>je suis écrit en bleu</span>.

Utilisé de temps en temps, c'est une manière très simple de changer le style d'un contenu sur votre page.

### Le composant Highlight {#highlight-component}

Si votre ambition est de surligner du texte, il y a une meilleure solution : le **composant Highlight**.

Créez le fichier `src/components/Highlight/index.tsx` :

<Snippet filename="src/components/Highlight/index.tsx" source="src/components/Highlight/index.tsx" />

Éditez ensuite (ou créez) le fichier `src/theme/MDXComponents.js`. Si le fichier existe déjà, ajoutez simplement les lignes surlignées ci-dessous. S'il n'existe pas encore, créez-le avec le contenu ci-dessous :

<Snippet filename="src/theme/MDXComponents.js" >

```js
import React from "react";

import MDXComponents from "@theme-original/MDXComponents";

// [...]

// highlight-next-line
import Highlight from "@src/components/Highlight";

export default {
  // Reusing the default mapping
  ...MDXComponents,

  // [...]

  // highlight-next-line
  Highlight
};

```

</Snippet>

Le <Highlight color="#25c2a0">vert Docusaurus</Highlight> et le <Highlight color="#1877F2">bleu Facebook</Highlight> sont mes couleurs préférées.

Source : [MDX and React](https://docusaurus.io/docs/markdown-features/react#exporting-components)

## Mettre des lignes en évidence {#highlight-lines}

[Documentation officielle](https://docusaurus.io/docs/markdown-features/code-blocks#line-highlighting)

`// highlight-next-line` est **vraiment** utile quand vous voulez mettre en évidence les modifications que vous avez faites dans un bloc de code. *Quand le code vit dans un vrai fichier plutôt qu'en inline, j'utilise mon propre <Link to="/blog/docusaurus-snippets">composant de snippets de code</Link>, qui lit le fichier au moment du build : l'article ne peut donc jamais être désynchronisé.*

Imaginez que vous avez déjà écrit quelque chose comme *Cher lecteur, créez un fichier sur votre disque avec ce contenu...* et que vous fournissez un bloc de code avec ce contenu.

Plus loin dans votre article, vous demandez *éditez le fichier et faites ceci, ajoutez telle et telle ligne, ici et là*.

Avec `// highlight-next-line`, il est très facile de mettre les changements en évidence, par exemple :

<Vars port="8080" labels={{ port: "Port de l'host" }} />

<Snippet filename="compose.yaml" source="./files/compose.yaml" />

Vous voyez immédiatement où j'ai fait des modifications dans le contenu du fichier.
