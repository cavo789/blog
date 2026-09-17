---
slug: vscode-export-list-of-extensions
title: Exporter la liste des extensions installées dans VSCode
date: 2024-04-19
description: Exportez et partagez la liste de vos extensions VS Code installées avec la commande `code --list-extensions`. Découvrez comment générer directement les commandes d'installation pour configurer facilement une nouvelle machine avec PowerShell ou Linux.
authors: [christophe]
image: /img/v2/vscode_tips.webp
series: VSCode - Tips, extensions and shortcuts
mainTag: vscode
tags:
  - linux
  - vscode
language: fr
review_date: 2026-07-30
---
![Exporter la liste des extensions installées dans VSCode](/img/v2/vscode_tips.webp)

<TLDR>
Cet article montre comment exporter la liste des extensions VSCode installées avec `code --list-extensions`, puis transformer cette liste en commandes d'installation prêtes à l'emploi grâce à un one-liner PowerShell (`% { "code --install-extension $_" }`) ou son équivalent Linux (`xargs -L 1 echo code --install-extension`) — pratique pour partager votre configuration ou préparer une nouvelle machine.
</TLDR>

Une petite astuce : en lançant `code --list-extensions` dans une console (Linux ou DOS), vous obtenez la liste de toutes les extensions que vous avez installées dans VSCode.

Il suffit ensuite de copier/coller cette liste pour l'envoyer à un ami : *Hey, voici les extensions que j'utilise. Peut-être que l'une ou l'autre te sera utile.*

*Une meilleure façon de partager une configuration avec toute une équipe : mettez cette liste dans un `devcontainer.json` pour que tout le monde reçoive automatiquement les mêmes extensions ; voir <Link to="/blog/vscode-devcontainer">PHP development in a devcontainer with preinstalled code quality tools</Link>.*

<!-- truncate -->

La sortie de `code --list-extensions` ressemblera à ceci :

<!-- cspell:disable -->
<Terminal typewriter source="./files/terminal-2.txt" />
<!-- cspell:enable -->

Si vous utilisez PowerShell, vous pouvez aussi lancer `code --list-extensions | % { "code --install-extension $_" }` et la sortie ressemblera alors à ceci :

<!-- cspell:disable -->
<Terminal typewriter source="./files/terminal-1.txt" />

<!-- cspell:enable -->

Si vous êtes sous Linux, vous obtenez la même chose avec `code --list-extensions | xargs -L 1 echo code --install-extension`

Et c'est bien pratique : en lançant ces commandes, vous pouvez installer directement ces extensions.

Si vous cherchez quelques extensions à ajouter à cette liste, j'ai écrit sur <Link to="/blog/vscode-errorlens">Error Lens</Link>, qui affiche les erreurs directement dans le code au lieu de les cacher dans le panneau Problems, et <Link to="/blog/vscode-todo-tree">Todo Tree</Link>, qui rassemble tous les `TODO` et `FIXME` de votre code dans une seule vue.
