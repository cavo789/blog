---
slug: markdown-csv2md
title: Markdown - Convertir du CSV en tableaux Markdown
date: 2024-12-08
description: Convertissez rapidement du contenu CSV en tableaux Markdown propres et bien formatés grâce à l'outil CSV2MD. Découvrez comment utiliser ce convertisseur efficace, avec ses options de délimiteurs et de transposition des tableaux.
authors: [christophe]
image: /img/v2/csv.webp
mainTag: markdown
tags:
  - excel
  - markdown
language: fr
updates:
  - date: 2026-07-30
    note: "GitHub source repo (cavo789/marknotes_csv2md) archived Dec 2024; the live tool at csv2md.avonture.be remains operational."
---
![Markdown - Convertir du CSV en tableaux Markdown](/img/v2/csv.webp)

<TLDR>
Cet article présente CSV2MD (csv2md.avonture.be, source sur GitHub), un outil en ligne gratuit qui convertit instantanément du contenu CSV collé en un tableau Markdown formaté.
</TLDR>

Voyez aussi <Link to="/blog/markdown-xls2md">Markdown - Convert Excel ranges to Markdown tables</Link>. Pour un besoin de conversion bien plus large — des documents Word, PDF ou PowerPoint complets plutôt qu'un simple tableau — voyez <Link to="/blog/markitdown">Markitdown - Convert files and MS Office documents to Markdown</Link>.

À côté de mon script XLS2MD, vous pouvez aussi convertir très facilement un fichier CSV en Markdown.

Copiez/collez simplement votre contenu CSV, comme celui ci-dessous, dans la zone de texte principale affichée sur [Markdown - Convertir du CSV en tableaux Markdown](https://csv2md.avonture.be/) et profitez.

```csv
Column 1 Header,Column 2 Header
Row 1-1,Row 1-2
Row 2-1,Row 2-2
```
<!-- truncate -->

Voici une démo :

![Markdown - Convertir du CSV en tableaux Markdown](./images/demo.gif)

## Code source {#source-code}

Vous le trouverez aussi sur Github : [https://github.com/cavo789/marknotes_csv2md](https://github.com/cavo789/marknotes_csv2md).

<Snippet filename="index.php" source="./files/index.php" />
