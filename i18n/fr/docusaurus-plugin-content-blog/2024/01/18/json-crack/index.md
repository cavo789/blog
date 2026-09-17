---
slug: json-crack
title: Afficher un fichier JSON sous forme de mind map
date: 2024-01-18
description: Transformez des données JSON complexes en mind maps claires et interactives avec JSON Crack. Découvrez comment cet outil puissant simplifie la visualisation et la compréhension des données.
authors: [christophe]
image: /img/v2/mindmaps.webp
series: Diagrams as code
mainTag: doc-as-code
tags:
  - doc-as-code
  - linux
  - vscode
language: fr
review_date: 2026-07-30
---
![Afficher un fichier JSON sous forme de mind map](/img/v2/mindmaps.webp)

<TLDR>
Cet article présente JSON Crack, un outil en ligne gratuit qui affiche du contenu JSON sous forme de mind map / diagramme interactif au lieu d'un texte brut imbriqué, ce qui rend les structures complexes beaucoup plus lisibles d'un coup d'œil. Il montre deux exemples de fichiers JSON rendus sous forme d'arbres visuels et mentionne la limitation du nombre de lignes de la version gratuite, ainsi qu'une extension VSCode comme alternative.
</TLDR>

> [https://jsoncrack.com/editor](https://jsoncrack.com/editor)

J'aime beaucoup l'idée de ne pas avoir à dessiner (en fait, c'est juste parce que je suis vraiment mauvais pour ça) un diagramme, un organigramme, une représentation graphique de quelque chose qui... peut s'écrire.

[JSON Crack](https://jsoncrack.com/editor) est l'un des outils de ma boîte à outils quand je veux dessiner quelque chose qui peut s'écrire en JSON. *Il côtoie <Link to="/blog/docker-mindmap">Markmap</Link> (même idée, mais depuis du Markdown) et <Link to="/blog/docker-diagram-as-code">les outils de diagram-as-code</Link> en général.*

*Quand vous avez juste besoin de lire le JSON plutôt que de le visualiser, <Link to="/blog/json-lint">JSON - Online linter</Link> et <Link to="/blog/linux-jq">`jq`</Link> font le travail.*

<!-- truncate -->

Prenons un exemple trouvé au hasard sur le net : [superheroes](https://medium.com/@Goldzila/superheroes-of-data-exploring-xml-json-and-binary-formats-through-the-lens-of-marvel-characters-3754f2691cdc). Comment représenter Spider-Man sous forme d'objet JSON ? Voici une tentative :

<Snippet filename="superheroes.json" source="./files/superheroes.json" />

Ce n'est pas plus sympa en version visuelle ?

![JSON Crack](./images/spiderman_json.webp)

Un autre exemple (trouvé [ici](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/JSON)) :

<Snippet filename="superheroes.json" source="./files/superheroes.part2.json" />

![Super hero squad](./images/super_hero_squad.webp)

L'avantage de l'image, c'est qu'elle est beaucoup plus claire : on voit tout de suite que l'équipe compte trois membres et que le plus fort (et le plus vieux) est *Eternal Flame*, qui possède cinq pouvoirs.

<AlertBox variant="note">
JSON Crack a quelques limitations dans sa version gratuite, comme le nombre de lignes de votre contenu JSON. Vous pouvez aussi installer un [add-on pour vscode](https://marketplace.visualstudio.com/items?itemName=AykutSarac.jsoncrack-vscode).

</AlertBox>

D'autres outils JSON à connaître : <Link to="/blog/json-faker">générer de fausses données JSON</Link> et <Link to="/blog/json-lint">linter et valider vos fichiers JSON</Link>.
