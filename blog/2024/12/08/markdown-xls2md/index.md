---
slug: markdown-xls2md
title: Markdown - Convert Excel ranges to Markdown tables
date: 2024-12-08
description: Easily convert Excel ranges into clean Markdown tables with the XLS2MD online tool. Just copy your cells and paste to generate the code and a live HTML preview.
authors: [christophe]
image: /img/v2/markdown.webp
mainTag: excel
tags: [excel, markdown, tips]
language: en
---
![Markdown - Convert Excel ranges to Markdown tables](/img/v2/markdown.webp)

See also <Link to="/blog/markdown-csv2md">Markdown - Convert CSV to Markdown tables</Link>.

I'm a big fan of Markdown for my documentation, and from time to time I have to convert a range in Excel into a table to copy and paste into my documentation.

Years ago, I've found this repo [https://github.com/jonmagic/copy-excel-paste-markdown](https://github.com/jonmagic/copy-excel-paste-markdown) and it's was the trigger for creating an online application in VueJS to make the magic happens.

In practical terms, I open my Excel file, select a range (a series of columns and rows) f.i. `$A$1:$J:$50`, press <kbd>CTRL</kbd>+<kbd>C</kbd> on the keyboard, switch to my [Markdown - Convert Excel ranges to Markdown tables](https://xls2md.avonture.be/) website, press <kbd>CTRL</kbd>+<kbd>V</kbd> and the table is converted.

<!-- truncate -->

It's ... magical

Here is a demo:

![Markdown - Convert Excel ranges to Markdown tables](./images/demo.gif)

## Source code

You can find it on Github too: [https://github.com/cavo789/marknotes_xls2md/tree/master](https://github.com/cavo789/marknotes_xls2md/tree/master).

<Snippet filename="index.php" source="./files/index.php" />