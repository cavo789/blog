---
slug: bash-ascii-art
title: Bash - ASCII art
date: 2023-12-19
description: Apprenez à ajouter des bannières en ASCII art à vos scripts Bash pour un impact visuel plus fort. Avec un exemple de code complet.
authors: [christophe]
image: /img/v2/ascii_art.webp
series: Writing better Bash scripts
mainTag: bash
tags:
  - bash
  - linux
language: fr
review_date: 2026-07-30
---
![Bash - ASCII art](/img/v2/ascii_art.webp)

<TLDR>
Ce court article montre comment ajouter une bannière en ASCII art à vos scripts Bash pour un peu de style visuel, générée avec l'outil gratuit patorjk.com/software/taag et affichée en haut du script.
</TLDR>

J'écris beaucoup de scripts Bash et j'aime garder la même approche pour chacun : une bannière, <Link to="/blog/bash-logging">une fonction de logging</Link>, <Link to="/blog/linux-generate-documentation-from-bash-scripts">des blocs de documentation au-dessus de chaque fonction</Link>. Une des choses que je fais toujours, c'est d'inclure une bonne vieille bannière en *ASCII Art*, peut-être pour le côté geek, mais surtout pour avoir un impact visuel plus fort.

J'utilise [https://patorjk.com/software/taag](https://patorjk.com/software/taag) pour créer mes bannières, alors regardons ça de plus près. *La même idée, appliquée à un site web plutôt qu'à une console : <Link to="/blog/docusaurus-ascii-art">Inject ASCII Art in any HTML pages rendered by Docusaurus</Link>.*

![Exemple d'ASCII art](./images/sample.webp)

<!-- truncate -->

De mon côté, j'implémente la bannière comme ceci :

<Snippet filename="script.sh" source="./files/script.sh" />

Et voici à quoi ça ressemble dans mon terminal bash :

![Terminal](./images/terminal.webp)
