---
slug: vscode-errorlens
title: L'extension Error Lens pour VSCode
date: 2024-03-03
description: Ne manquez plus jamais un avertissement ! L'extension Error Lens pour VSCode affiche les erreurs, notices et avertissements directement dans la zone d'édition, ce qui vous aide à écrire du meilleur code plus vite et à repérer les fautes de frappe qui provoquent des bugs silencieux.
authors: [christophe]
image: /img/v2/vscode_tips.webp
series: VSCode - Tips, extensions and shortcuts
mainTag: vscode
tags:
  - code-quality
  - vscode
language: fr
review_date: 2026-07-30
---
![L'extension Error Lens pour VSCode](/img/v2/vscode_tips.webp)

<TLDR>
Cet article présente l'extension VSCode Error Lens, qui affiche les erreurs, avertissements et notices directement dans l'éditeur au lieu de les cacher dans le panneau *Problems* ou la barre de statut, où on ne les voit jamais. L'auteur raconte qu'elle a permis de détecter de nombreux bugs silencieux au bureau — fautes de frappe dans des noms de classes CSS, variables mal orthographiées — simplement en rendant les diagnostics existants impossibles à ignorer.
</TLDR>

Tout récemment, j'ai découvert [usernamehw.errorlens](https://marketplace.visualstudio.com/items?itemName=usernamehw.errorlens) et c'est dommage de ne pas l'avoir vue avant.

**Error Lens** est une extension pour VSCode qui affiche les erreurs, notices, avertissements, etc. directement dans l'éditeur, alors qu'ils ne sont généralement accessibles que dans la zone *Problems* de VSCode.

*Elle est installée par défaut dans mon <Link to="/blog/vscode-devcontainer">devcontainer PHP</Link> : dès que les linters de ce container signalent quelque chose, Error Lens rend l'information impossible à manquer.*

Saviez-vous où se trouve cette zone ? Dans la barre de statut de la fenêtre principale de VSCode. L'avez-vous déjà remarquée ? Presque personne ne la voit, et pourtant elle mérite le coup d'œil !

![Barre de statut](./images/status_bar.webp)

On voit ici que j'ai 54 *problems*, aïe.

<!-- truncate -->

L'image ci-dessous, c'est mon VSCode actuel avec cet article ouvert. Ok, je vois quelques mots soulignés en bleu mais... ce n'est pas vraiment « visible ». Sur un gros fichier, il y a de fortes chances que vous ne le voyiez pas.

![Sans Error Lens](./images/without_error_lens.webp)

Maintenant, une fois Error Lens installée, voici le même écran :

![Avec Error Lens](./images/with_error_lens.webp)

Toute la ligne a désormais un fond bleu-gris, et je vois aussi dans la minimap (sur le côté droit de l'écran) que j'ai deux blocs bleus, donc deux *problems*.

Ça n'a l'air de rien puisque ça ne fait que « montrer » les problèmes dans la zone d'édition, mais au bureau ça a mis en évidence énormément d'erreurs (fautes d'orthographe ou de grammaire dans les textes, fautes de frappe comme `cente` au lieu de `center` pour une classe CSS, une faute dans le nom d'une variable PHP, etc.).

Ça a nettement amélioré la qualité de notre code et supprimé quelques bugs silencieux (*Mais pourquoi cette zone de l'écran n'est pas centrée ? J'ai bien ajouté la classe `msg-center`... ah non, j'ai oublié le `r`.*)

Dans la même famille « arrêter de perdre des informations dans un panneau que personne n'ouvre », <Link to="/blog/vscode-todo-tree">Todo Tree in VSCode</Link> fait pour vos commentaires `TODO` et `FIXME` ce qu'Error Lens fait pour les diagnostics.
