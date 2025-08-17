---
slug: docusaurus-articles-tips
title: Some tips and tricks when written articles for Docusaurus
authors: [christophe]
serie: Discovering Docusaurus
image: /img/docusaurus_tips_social_media.jpg
mainTag: docusaurus
tags: [markdown, docusaurus, tips]
enableComments: true
---
![Some tips and tricks when written articles for Docusaurus](/img/docusaurus_tips_banner.jpg)

If you're writing for Docusaurus, there are a few tips to know.

This article is by no means exhaustive, but for me it's a reminder of the features that are really essential and must not be forgotten.

<!-- truncate -->

## Read more

[Official documentation](https://docusaurus.io/docs/blog#blog-list)

In blog mode, your article is divided into two parts: the introduction with a *Read More* link, and then the main part of the article.

To activate this feature, simply add the line `<!-- truncate -->` (preceded and followed by an empty line) where you wish to distinguish between the introduction and the main part.

If you go to my [blog](/blog) page, each articles have an introduction followed by a `<!-- truncate -->` line in my Markdown source.

## Admonitions

[Official documentation](https://docusaurus.io/docs/markdown-features/admonitions)

Used to highlight a paragraph in your document, f.i. a *Pay attention to...* or *Tip: Did you know that...* box.

```markdown
:::caution Pay attention to...
Never give your bank card code to a stranger.
:::
```

Will be displayed by Docusaurus like this:

:::caution Pay attention to...
Never give your bank card code to a stranger.
:::

## Inline style

Docusaurus supports inline style by the use of a `<span> ... </span>` notation.

The notation `<span style={{color: 'blue'}}>I'm written in blue</span>` will give <span style={{color: 'blue'}}>I'm written in blue</span>.

Used very occasionally, this is a very simple way of changing the style of content on your page.

## Highlight lines

[Official documentation](https://docusaurus.io/docs/markdown-features/code-blocks#line-highlighting)

The `// highlight-next-line` is **really** useful when you wish to put in evidence changes you've done to a give code block.

Imagine you've already written something like *Dear reader, please create a file on your disk with this content...* and you provide a code block with that content.

Later in your article, you ask 'Please edit the file and make this and *please edit the file and add this and that line, here and there*.

With `// highlight-next-line`, it's really easy to highlight changes, for instance:

<Snippets filename="compose.yaml">

```yaml
name: kingsbridge

services:
  joomla:
    image: joomla
    restart: always
    ports:
      - 8080:80
    environment:
      - JOOMLA_DB_HOST=joomladb
      - JOOMLA_DB_PASSWORD=example
    // highlight-next-line
    user: 1000:1000
    // highlight-next-line
    volumes:
      // highlight-next-line
      - ./site_joomla:/var/www/html

  joomladb:
    image: mysql:8.0.13
    restart: always
    environment:
      - MYSQL_ROOT_PASSWORD=example
    // highlight-next-line
    user: 1000:1000
    // highlight-next-line
    volumes:
      // highlight-next-line
      - ./db:/var/lib/mysql
```

</Snippets>

You can immediately see where I've made some changes in the file's content.
