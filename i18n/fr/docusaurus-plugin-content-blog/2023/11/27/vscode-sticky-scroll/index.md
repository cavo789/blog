---
slug: vscode-sticky-scroll
title: Le sticky scroll dans vscode
date: 2023-11-27
description: Activez la puissante fonctionnalité Sticky Scroll de VS Code ! Gardez les lignes de contexte (comme les classes, les fonctions ou les titres de section) épinglées en haut de votre éditeur pour naviguer sans effort dans votre code et vos documents.
authors: [christophe]
image: /img/v2/vscode_tips.webp
series: VSCode - Tips, extensions and shortcuts
mainTag: vscode
tags:
  - php
  - vscode
language: fr
review_date: 2026-07-30
---
![Le sticky scroll dans vscode](/img/v2/vscode_tips.webp)

<TLDR>
Cet article présente la fonctionnalité Sticky Scroll de VSCode, qui épingle en haut de l'éditeur les lignes de contexte (nom de la classe, nom de la fonction, niveau de titre courant en Markdown, etc.) au fur et à mesure que vous défilez. Vous savez ainsi toujours où vous êtes dans le fichier. Il suffit d'ajouter `"editor.stickyScroll.enabled": true` dans `settings.json`.
</TLDR>

> [https://dev.to/amrsamy/vs-code-sticky-scroll-2jcd](https://dev.to/amrsamy/vs-code-sticky-scroll-2jcd)

VS Code a récemment ajouté une nouvelle fonctionnalité vraiment utile : le sticky scroll.

Cette fonction vous permet de défiler dans un document comme un <Link to="/blog/vscode-markdown-code-folding">fichier Markdown</Link>, du code source écrit en PHP ou en JavaScript, ou n'importe quel autre langage supporté et, pendant le défilement, d'épingler dans la partie supérieure de l'éditeur des informations de contexte comme le nom de la classe, le nom de la fonction, le début de la boucle, etc.

*Ça se marie très bien avec le folding de code : <Link to="/blog/vscode-regions">Working with regions in VSCode</Link> vous permet de replier des blocs entiers, et le sticky scroll vous garde orienté dans ceux que vous avez laissés ouverts.*

<!-- truncate -->

C'est vraiment très pratique. Voyez l'illustration ci-dessous (*image provenant de [https://dev.to/amrsamy/vs-code-sticky-scroll-2jcd](https://dev.to/amrsamy/vs-code-sticky-scroll-2jcd)*)

![Le sticky scroll dans vscode](./images/sticky_scroll.gif)

Voici un exemple tiré de ce blog :

![Sticky scroll en markdown](./images/sticky_scroll_markdown.webp)

Comme vous pouvez le voir, j'ai ouvert un fichier markdown et j'affiche une partie de l'article autour de la ligne 878. Regardez les premières lignes « collées » en haut de la fenêtre : VS Code m'affiche mon titre 1, mon titre 2 et mon titre 3, je connais donc le contexte. Les lignes affichées se situent dans le chapitre `Make it easy`. Plutôt sympa !

Pour activer la fonctionnalité, éditez votre fichier `settings.json` et ajoutez cette entrée :

<Snippet filename="settings.json" source="./files/settings.json" />

Le sticky scroll vous aide à savoir *où* vous êtes dans un long fichier. L'autre moitié du problème, c'est de masquer ce dont vous n'avez pas besoin dans l'immédiat, et c'est le sujet de <Link to="/blog/vscode-regions">Working with regions in VSCode</Link>.
