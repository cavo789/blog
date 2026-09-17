---
slug: quarto-callout-blocks
title: Les blocs Callout de Quarto
date: 2024-04-13
description: Découvrez la syntaxe des blocs Callout de Quarto pour créer des encadrés qui attirent l'attention (Tips, Warnings, Cautions) dans vos rapports. Inclut un snippet VSCode bien pratique.
authors: [christophe]
image: /img/v2/quarto.webp
series: Discovering Quarto
mainTag: quarto
tags:
  - markdown
  - quarto
  - vscode
language: fr
review_date: 2026-07-30
---
![Les blocs Callout de Quarto](/img/v2/quarto.webp)

<TLDR>
Cet article présente la syntaxe des blocs callout de Quarto (`:::{.callout-caution}`, `:::{.callout-tip}`, etc.) pour créer des encadrés mis en évidence dans les sorties PDF, HTML et revealJS — l'équivalent Quarto de l'`<AlertBox>` de Docusaurus — et fournit un snippet VSCode qui vous demande de façon interactive le type de callout, le titre et le contenu, pour ne plus jamais avoir à retenir la syntaxe exacte.
</TLDR>

Un callout (appelé *admonition* par [Docusaurus](https://docusaurus.io/docs/markdown-features/admonitions)) est une syntaxe spéciale utilisée pour mettre un paragraphe en évidence, par exemple un encadré *Faites attention à...* ou *Astuce : saviez-vous que...*. *Du côté de Docusaurus, j'ai abordé cette syntaxe dans <Link to="/blog/docusaurus-articles-tips">Some tips and tricks when written articles for Docusaurus</Link>.*

Sur ce blog propulsé par Docusaurus, la syntaxe d'une *admonition* est

```markdown
<AlertBox variant="caution" title="Pay attention to...">
Never give your bank card code to a stranger.

</AlertBox>
```

et le rendu est le suivant

<AlertBox variant="caution" title="Faites attention à...">
Ne donnez jamais le code de votre carte bancaire à un inconnu.

</AlertBox>

Et maintenant une petite astuce :

<AlertBox variant="info" title="Saviez-vous que...">
En vous couchant plus tôt, vous aurez un sommeil de meilleure qualité.

</AlertBox>

Quarto implémente cela un peu différemment, voyons donc comment...

<!-- truncate -->

<AlertBox variant="info" title="Image Docker avec Quarto">
Si vous n'avez pas encore d'image Docker avec Quarto, lisez cet article : <Link to="/blog/docker-quarto">Running Quarto Markdown in Docker</Link>.

</AlertBox>

## Syntaxe {#syntax}

Malheureusement, cette syntaxe ne fait pas partie du langage Markdown standard : chaque outil a donc la sienne.

Pour Quarto, la syntaxe est :

```markdown
:::{.callout-caution}
## Pay attention to...
Never give your bank card code to a stranger.
:::
```

Et ce paragraphe est converti comme ceci en PDF :

![Callout Caution en PDF](./images/caution-pdf.webp)

La syntaxe Quarto pour une astuce est :

```markdown
:::{.callout-tip}
## Did you know that...
By going to bed earlier, you'll get better quality sleep.
:::
```

![Callout Tip en PDF](./images/tip-pdf.webp)

Les callouts sont supportés en PDF, HTML, revealJS et d'autres formats.

Retrouvez la syntaxe en détail dans la [documentation officielle](https://quarto.org/docs/authoring/callouts.html).

## Snippet VSCode {#vscode-snippet}

Si vous utilisez VSCode, ne faites pas l'effort de retenir la syntaxe exacte : utilisez la fonctionnalité *Snippet* de VSCode.

Appuyez sur <kbd>CTRL</kbd>-<kbd>SHIFT</kbd>-<kbd>P</kbd> pour accéder à la **Command Palette**.

Commencez à taper `Configure User Snippets`, validez et sélectionnez `markdown.json` puisque nos snippets ne doivent être disponibles que lors de l'écriture de contenu Markdown.

![Création d'un snippet](./images/create-snippets.webp)

S'il s'agit de votre premier snippet, le fichier JSON sera vide. Copiez/collez le texte ci-dessous. Sinon, copiez simplement le nœud `callout` et collez-le au bon endroit dans votre fichier.

<Snippet filename="markdown.json" source="./files/markdown.json" />

Enregistrez et fermez le fichier `markdown.json`, puis retournez dans n'importe quel fichier markdown (ou créez-en un nouveau).

Maintenant, en tapant `quarto` puis en appuyant sur <kbd>CTRL</kbd>-<kbd>space</kbd>, VSCode affichera la liste des possibilités pour ce mot et vous y retrouverez votre snippet. Sélectionnez-le et appuyez sur <kbd>Enter</kbd> pour valider.

![Appel du snippet](./images/call-snippets.webp)

Et, comme vous pouvez le voir sur l'image ci-dessous, VSCode va vous demander trois choses :

1. D'abord le type de callout, avec une liste de valeurs possibles ; facile, non ?
2. Ensuite, après avoir appuyé sur la touche <kbd>tab</kbd>, il vous sera demandé de saisir un titre et, enfin,
3. Le contenu de votre paragraphe.

![Utilisation du snippet](./images/using-snippet.webp)

VSCode vous montre le snippet de façon interactive et vous pouvez ainsi le créer facilement, sans avoir à retenir la syntaxe exacte.

```markdown
:::{.callout-caution}
## Pay attention to...
Never give your bank card code to a stranger.
:::
```
