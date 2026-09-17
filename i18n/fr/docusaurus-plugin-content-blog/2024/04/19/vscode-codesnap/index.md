---
slug: vscode-codesnap
title: L'extension CodeSnap pour VSCode
date: 2024-04-19
description: Prenez facilement de belles captures d'écran partageables de vos snippets de code directement dans VS Code avec l'extension CodeSnap. Un guide simple, étape par étape.
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
![L'extension CodeSnap pour VSCode](/img/v2/vscode_tips.webp)

<TLDR>
Cet article présente l'extension VSCode CodeSnap, qui génère une capture d'écran joliment mise en forme du code sélectionné directement depuis l'éditeur : lancez la commande `CodeSnap`, sélectionnez les lignes à capturer dans l'aperçu en direct, puis enregistrez l'image obtenue.
</TLDR>

L'extension [CodeSnap](https://marketplace.visualstudio.com/items?itemName=adpyke.codesnap) va **prendre de belles captures d'écran de votre code dans VS Code** sans effort.

*Pratique pour les réseaux sociaux, mais pas pour un article de blog : une image de code ne peut pas être copiée, cherchée ni indexée. Pour ça, utilisez un vrai bloc de code — voir <Link to="/blog/docusaurus-snippets">A component for showing code snippets in a Docusaurus blog</Link>.*

Ouvrez votre fichier dans VS Code, pressez <kbd>CTRL</kbd>-<kbd>SHIFT</kbd>-<kbd>P</kbd> et lancez `CodeSnap`. Il ne vous reste plus qu'à sélectionner des lignes.

![CodeSnap partial example](./images/partial.webp)

<!-- truncate -->

## Résultat {#result}

Voilà ce que CodeSnap produit à partir d'une sélection de code source PHP — une image mise en forme, prête à être partagée :

![Sample example for CodeSnap](./images/codesnap.webp)

Dès que vous avez appelé `CodeSnap`, une fenêtre d'aperçu verticale apparaît.

Dans votre code source, sélectionnez une ou plusieurs lignes et CodeSnap met l'aperçu à jour.

Quand c'est bon, cliquez simplement sur le bouton `Polaroid` juste au-dessus de l'aperçu, enregistrez l'image et c'est fini — c'est l'exemple PHP montré plus haut.

Comme ces captures sont faites pour être partagées, la police que vous utilisez apparaît sur chacune d'elles. Si vous n'en avez pas encore choisi une volontairement, voyez <Link to="/blog/vscode-jetbrains-font">Using the JetBrains Mono font in vscode</Link>.
