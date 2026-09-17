---
slug: vscode-todo-tree
title: Todo Tree dans VSCode
date: 2025-03-07
description: N'oubliez plus jamais vos TODO et FIXME ! Utilisez l'extension VSCode Todo Tree pour rassembler toutes les annotations de code comme TODO, FIXME et TEMPORARY dans un tableau de bord facile à suivre.
authors: [christophe]
image: /img/v2/vscode_tips.webp
series: VSCode - Tips, extensions and shortcuts
mainTag: vscode
tags:
  - code-quality
  - vscode
language: fr
review_date: 2026-07-30
blueskyRecordKey: 3lvnk2w4vss2v
---
![Todo Tree dans VSCode](/img/v2/vscode_tips.webp)

<TLDR>
Ne perdez plus jamais la trace de vos annotations de code. Cet article présente l'extension « Todo Tree » pour Visual Studio Code, un outil puissant qui parcourt tout votre workspace à la recherche de commentaires comme `TODO`, `FIXME` et d'autres tags personnalisés. Elle les organise ensuite dans une vue arborescente pratique, dans la barre latérale, ce qui vous permet de voir d'un coup d'œil toutes vos tâches en attente et de naviguer directement vers le code concerné en un clic. Une extension essentielle pour rester organisé et ne laisser passer aucune tâche.
</TLDR>

Quand vous travaillez sur une grosse base de code, vous finirez tôt ou tard par tomber sur des annotations du type `@TODO` ou `// TODO`, laissées là par quelqu'un (peut-être vous) comme pense-bête : « Ne pas oublier de (faire quelque chose)... ». Et, à coup sûr, ces todos restent là des mois ou des années parce que, eh oui, le programmeur a oublié qu'ils étaient là.

Personnellement, il m'arrive de travailler sur du code et de commenter l'appel à une méthode ou à un bloc précis. Souvent pendant une session de debug (par exemple sur des scripts Bash sous Linux) mais, attention, il ne faut pas oublier de retirer les commentaires et de remettre le code dans son état d'origine. Dans ce cas, j'ajoute un commentaire comme `// TEMPORARY` juste avant la première ligne commentée.

*Un tableau de bord vous aide à vous souvenir ; un hook, lui, vous arrête. <Link to="/blog/git-precommit">Git - pre-commit-hooks</Link> peut refuser un commit qui contient encore un marqueur `TEMPORARY`.*

L'idée derrière l'extension vscode `Todo Tree` (la page de téléchargement se trouve ici : [https://marketplace.visualstudio.com/items?itemName=Gruntfuggly.todo-tree](https://marketplace.visualstudio.com/items?itemName=Gruntfuggly.todo-tree)) est de rassembler ce type d'annotations et d'afficher un tableau de bord avec tous les `TODOS`, `TOFIX`, ... et les vôtres aussi.

<!-- truncate -->

Une fois l'extension installée, une nouvelle icône apparaît dans votre barre latérale gauche (voir le repère 1. sur l'image ci-dessous). En cliquant dessus, vous obtenez des entrées comme `BUG`, `CHECK`, `FIXME`, `TODO`, ... et en cliquant sur une entrée, vous êtes directement redirigé vers l'endroit où se trouve le todo dans votre base de code.

![Todo Tree dans VSCode](./images/todo-tree.webp)

Grâce à ce récapitulatif, vous n'oublierez plus jamais vos todos, vos bidouilles temporaires, les choses qu'il reste à corriger, ...

Je vous recommande la lecture de l'article [https://dev.to/koustav/how-a-vs-code-extension-todo-tree-can-make-your-coding-easier-todo-tree-configuration-and-use-cases-11kc](https://dev.to/koustav/how-a-vs-code-extension-todo-tree-can-make-your-coding-easier-todo-tree-configuration-and-use-cases-11kc) pour en savoir plus.

Vraiment une chouette extension pour ne plus jamais oublier vos annotations TODO, TOFIX, TEMPORARY, ...

Si l'idée de faire remonter ce que votre éditeur garde normalement hors de vue vous plaît, jetez aussi un œil à <Link to="/blog/vscode-errorlens">Error Lens</Link> : il fait la même chose pour les erreurs et les avertissements, directement dans la zone d'édition. Et une fois que vous aurez réuni quelques extensions indispensables, <Link to="/blog/vscode-export-list-of-extensions">exporter votre liste d'extensions</Link> vous permettra de les réinstaller facilement sur votre prochaine machine.
