---
slug: quarto-inline-style
title: Style inline avec Quarto
date: 2024-04-13
description: Appliquez rapidement des styles CSS inline dans Quarto pour vos documents HTML avec la syntaxe []{}. Mettez un texte en évidence instantanément, sans écrire une classe CSS complète.
authors: [christophe]
image: /img/v2/quarto.webp
series: Discovering Quarto
mainTag: quarto
tags:
  - markdown
  - quarto
language: fr
review_date: 2026-07-30
---
![Style inline avec Quarto](/img/v2/quarto.webp)

<TLDR>
Cet article présente la syntaxe de span CSS inline de Quarto `[text]{style="..."}`, pratique pour styler rapidement un bout de texte (couleur, fond, etc.) sans définir de classe CSS — sachant qu'elle ne fonctionne qu'en sortie HTML et qu'elle est ignorée silencieusement en Word ou en PDF.
</TLDR>

Pas envie de perdre du temps à créer une classe CSS et à comprendre comment l'intégrer dans Quarto juste pour mettre en évidence une partie de votre paragraphe ?

Quarto supporte une syntaxe de *style CSS inline* pour produire des **documents HTML** (cela ne fonctionne pas pour, par exemple, le pdf ou le docx). *Si c'est le contenu lui-même, et pas seulement son style, qui doit varier d'un format à l'autre, voyez <Link to="/blog/quarto-conditional-display">Quarto conditional display</Link>.*

<AlertBox variant="info" title="Syntaxe">
Vous pouvez appliquer des styles à du texte inline en créant des spans : `[]` entoure le texte à styler et `{}` définit le style à appliquer.

</AlertBox>

<!-- truncate -->

Donc, pour afficher un texte comme *rouge* en <span style={{color: 'red'}}>rouge</span>, la syntaxe Quarto est `[red]{style="color: red;"}`. Le texte entre crochets recevra le style CSS inline spécifié.

```markdown
# Inline style

To draw attention to a specific part of the text, you might want to make it [red]{style="color: red;"} with a [yellow background]{style="background-color: yellow;"}; [like this]{style="color: red; background-color: yellow;"}.
```

Le rendu est correct en HTML :

![html](./images/html.webp)

> [source](https://mine-cetinkaya-rundel.github.io/quarto-tip-a-day/posts/11-spans/).

<AlertBox variant="info" title="Image Docker avec Quarto">
Si vous n'avez pas encore d'image Docker avec Quarto, lisez cet article <Link to="/blog/docker-quarto">Running Quarto Markdown in Docker</Link>.

</AlertBox>

Mais c'est tout simplement ignoré en Word ou en PDF :

![docx](./images/docx.webp)

![pdf](./images/pdf.webp)
