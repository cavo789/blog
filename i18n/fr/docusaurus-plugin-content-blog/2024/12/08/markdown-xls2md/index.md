---
slug: markdown-xls2md
title: Markdown - Convertir des plages Excel en tableaux Markdown
date: 2024-12-08
description: Convertissez facilement vos plages Excel en tableaux Markdown propres avec l'outil en ligne XLS2MD. Copiez vos cellules, collez-les et obtenez le code ainsi qu'un aperçu HTML en direct.
authors: [christophe]
image: /img/v2/markdown.webp
mainTag: excel
tags:
  - excel
  - markdown
language: fr
updates:
  - date: 2026-07-30
    note: "GitHub source repo cavo789/marknotes_xls2md archived Dec 8, 2024 (read-only); the online tool at xls2md.avonture.be remains fully functional."
---
![Markdown - Convertir des plages Excel en tableaux Markdown](/img/v2/markdown.webp)

<TLDR>
Cet article présente XLS2MD (xls2md.avonture.be, sources sur GitHub), un outil en ligne gratuit qui convertit une plage Excel copiée directement en tableau Markdown : sélectionnez les cellules dans Excel, copiez, collez dans le site et obtenez instantanément la sortie Markdown.
</TLDR>

Voyez aussi <Link to="/blog/markdown-csv2md">Markdown - Convert CSV to Markdown tables</Link>. Pour un besoin de conversion beaucoup plus large — des documents Word, PDF ou PowerPoint complets plutôt qu'une simple plage — voyez <Link to="/blog/markitdown">Markitdown - Convert files and MS Office documents to Markdown</Link>.

Je suis un grand fan du Markdown pour ma documentation et, de temps en temps, je dois convertir une plage Excel en tableau pour la copier-coller dans ma documentation. *Documentation qui, la plupart du temps, est ensuite rendue avec <Link to="/blog/docker-quarto">Quarto</Link>.*

Il y a des années, j'ai trouvé ce repo [https://github.com/jonmagic/copy-excel-paste-markdown](https://github.com/jonmagic/copy-excel-paste-markdown) et ça a été le déclencheur pour créer une application en ligne en VueJS afin de faire la magie.

Concrètement, j'ouvre mon fichier Excel, je sélectionne une plage (une série de colonnes et de lignes), par exemple `$A$1:$J$50`, j'appuie sur <kbd>CTRL</kbd>+<kbd>C</kbd> au clavier, je passe sur mon site [Markdown - Convertir des plages Excel en tableaux Markdown](https://xls2md.avonture.be/), j'appuie sur <kbd>CTRL</kbd>+<kbd>V</kbd> et le tableau est converti.

<!-- truncate -->

C'est ... magique

Voici une démo :

![Markdown - Convertir des plages Excel en tableaux Markdown](./images/demo.gif)

## Code source {#source-code}

Vous le trouverez aussi sur Github : [https://github.com/cavo789/marknotes_xls2md/tree/master](https://github.com/cavo789/marknotes_xls2md/tree/master).

<Snippet filename="index.php" source="./files/index.php" />
