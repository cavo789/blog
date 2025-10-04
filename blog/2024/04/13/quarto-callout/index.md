---
date: 2024-04-13
slug: quarto-callout-blocks
title: Quarto Callout Blocks
authors: [christophe]
image: /img/v2/quarto.webp
series: Discovering Quarto
description: Discover the Quarto Callout Block syntax for creating attention-grabbing admonitions (Tips, Warnings, Cautions) in your reports. Includes a handy VSCode snippet.
mainTag: quarto
tags: [markdown, quarto, tips, vscode]
---
![Quarto Callout Blocks](/img/v2/quarto.webp)

A callout (called *admonition* by [Docusaurus](https://docusaurus.io/docs/markdown-features/admonitions)) is a special syntax used to highlight a paragraph, f.i. a *Pay attention to...* or *Tip: Did you know that...* box.

On this blog powered by Docusaurus, the syntax for *admonition* is

```markdown
:::caution Pay attention to...
Never give your bank card code to a stranger.
:::
```

and this is rendered like

:::caution Pay attention to...
Never give your bank card code to a stranger.
:::

And now a nice tip:

:::tip Did you know that...
By going to bed earlier, you'll get better quality sleep.
:::

Quarto implements this a little differently, so let's have a look...

<!-- truncate -->

:::tip Docker image with Quarto
If you don't have yet a Docker image with Quarto, read this article <Link to="/blog/docker-quarto">Running Quarto Markdown in Docker</Link>.
:::

## Syntax

Unfortunately, the syntax is not part of the standard Markdown language so every tool has his own actually.

For Quarto, the syntax is:

```markdown
:::{.callout-caution}
## Pay attention to...
Never give your bank card code to a stranger.
:::
```

And, that paragraph is converted like this in PDF:

![Callout Caution in PDF](./images/caution-pdf.png)

The Quarto syntax for a tip is:

```markdown
:::{.callout-tip}
## Did you know that...
By going to bed earlier, you'll get better quality sleep.
:::
```

![Callout Tip in PDF](./images/tip-pdf.png)

Callouts are supported in PDF, HTML, revealJS and other formats.

Get in-depth syntax on the [official documentation](https://quarto.org/docs/authoring/callouts.html)

## VSCode snippet

If you're a VSCode user, don't make effort to remind the correct syntax but use the *Snippet* feature of VSCode.

Press <kbd>CTRL</kbd>-<kbd>SHIFT</kbd>-<kbd>P</kbd> to get access to the **Command Palette**.

Start to type `Configure User Snippets`, validate and select `markdown.json` since our snippets should be available only when writing Markdown content.

![Creating a snippet](./images/create-snippets.png)

If this is your first snippet, the JSON file will be empty. Copy/paste the text below. Otherwise, just copy the `callout` node and paste it in your file to the correct location.

<Snippet filename="markdown.json">

```json
{
    "callout": {
        "prefix": "quarto-callout",
        "body": [
            ":::{.callout-${1|note,tip,warning,caution,important|}}",
            "## ${2:title}",
            "${3:body}",
            ":::"
        ],
        "description": "Add a callout paragraph to your markdown file"
    },
}
```

</Snippet>

Save and close the `markdown.json` file and go back to any markdown file (or create a new one).

Now, by typing `quarto` and by pressing <kbd>CTRL</kbd>-<kbd>space</kbd>, VSCode will show the list of possibilities for that word and you'll retrieve your snippet. Select it and press <kbd>Enter</kbd> to validate.

![Call the snippet](./images/call-snippets.png)

And, as you can see on the image below, VSCode will ask you three things:

1. First the tip of callout and you'll have a list of possible values; easy no?
2. Then, after having pressed the <kbd>tab</kbd> key, you'll be prompted to type a title and, finally,
3. The body of your paragraph.

![Using the snippet](./images/using-snippet.png)

VSCode will show you the snippet interactively and you can then, easily, create it without having to remind the correct syntax.

```markdown
:::{.callout-caution}
## Pay attention to...
Never give your bank card code to a stranger.
:::
```
