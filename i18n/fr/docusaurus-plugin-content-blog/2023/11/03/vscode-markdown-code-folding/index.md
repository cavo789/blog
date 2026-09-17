---
slug: vscode-markdown-code-folding
title: Le folding Markdown ne fonctionne pas
date: 2023-11-03
description: Réglez votre problème de folding Markdown dans VS Code ! Découvrez pourquoi le folding ne fonctionne pas et la solution simple pour activer le folding des blocs de code et des titres, pour une édition plus propre.
authors: [christophe]
image: /img/v2/vscode_tips.webp
series: VSCode - Tips, extensions and shortcuts
mainTag: vscode
tags:
  - markdown
  - vscode
language: fr
review_date: 2026-07-30
---
![Le folding Markdown ne fonctionne pas](/img/v2/vscode_tips.webp)

<TLDR>
Cet article résout un cas où le folding ne fonctionne pas dans l'éditeur Markdown de VSCode : assurez-vous que l'extension intégrée `@builtin Markdown Language Features` est activée.
</TLDR>

> [https://github.com/microsoft/vscode/issues/107130](https://github.com/microsoft/vscode/issues/107130)

Si le folding ne fonctionne pas en mode markdown, comme illustré ci-dessous, vérifiez que l'extension `@builtin Markdown Language Features` est bien activée. *Cette même extension intégrée alimente le <Link to="/blog/vscode-sticky-scroll">sticky scroll</Link> dans les fichiers Markdown, qui cesse de fonctionner pour la même raison.*

<!-- truncate -->

![code_folding](./images/code_folding.gif)

![Markdown Language Features](./images/markdown_language_features.webp)

Une fois le folding rétabli, vous voudrez peut-être mieux contrôler *ce qui* est repliable : <Link to="/blog/vscode-regions">Working with regions in VSCode</Link> montre comment définir vos propres blocs repliables, même dans des types de fichiers que VSCode ne gère pas nativement.
