---
slug: quarto-extensions
title: My favorite Quarto extensions
date: 2025-05-03
description: My favorite Quarto extensions - Learn about essential Quarto filters for partial content templating, Font Awesome icons, including external code files, and simple search-replace macros to enhance your documentation workflow.
authors: [christophe]
image: /img/v2/quarto.webp
mainTag: quarto
tags: [markdown, pandoc, quarto, revealjs]
language: en
blueskyRecordKey: 3lun2yevo622r
---
<!-- cspell:ignore frontmatter,fontawesome,gadenbuie,shafayetShafee -->

![My favorite Quarto extensions](/img/v2/quarto.webp)

I'm using Quarto now since 18 months to generate my documentation: I'm writing Markdown files (`.md`) and convert them as a Word document, PDF, static HTML site or as a revealjs slideshow.

Quarto is supporting external extensions (also called `plugins` elsewhere).

Below a list of a few I'm using.

<!-- truncate -->

## gadenbuie/quarto-partials

See [https://github.com/gadenbuie/quarto-partials/tree/main](https://github.com/gadenbuie/quarto-partials/tree/main)

When I come to this extension, my need was: I've coded more than 60 functionalities and I need to document them. Each will have the same look&feel like a *Description* chapter, a *How to run?*, *How to configure?*, *Remarks* and so on.

Sometimes the text will be exactly the same (like a generic text) and, in some cases, almost the same: the *How to configure?* chapter will have the same sentences except I've to replace some placeholders (like the name of the feature, the name of the configuration file, ...)

In other terms: I need to be able to write some *page template* and *inject* specific content to it.  I wish that my 60 functionalities pages look the same and if I need to change one global text, I have to do it in a central place.

[Partial content](https://github.com/gadenbuie/quarto-partials/tree/main) is perfect here. Based on their documentation, it's similar to [Mustache](https://mustache.github.io/).

### Example

Let's create a file called `_hello.md` with this content:

<Snippet filename="_hello.md">

```markdown
Hello, {{ name }}!
```

</Snippet>

Then, in any file, we can do:

<Snippet filename="test.md">

```markdown
{{< partial _hello.md name="John" >}}
```

</Snippet>

Make sure to add lines below in your YAML front matter:

<Snippet filename="test.md">

```yaml
filters:
   - quarto-partials
```

</Snippet>

We can pass variables like here above but, more powerful, we can declare a `partial-data` key in our YAML frontmatter.

## quarto-ext/fontawesome

See [https://github.com/quarto-ext/fontawesome](https://github.com/quarto-ext/fontawesome)

Use Font Awesome icons in HTML and PDF documents.

For instance, if you want to Github icon, you just need to put the `{{< fa brands github size=5x >}}` code in your file. Quite easy.

Make sure to add lines below in your YAML front matter:

<Snippet filename="test.md">

```yaml
filters:
   - include-code-files
```

</Snippet>

## quarto-ext/include-code-files

See [https://github.com/quarto-ext/include-code-files](https://github.com/quarto-ext/include-code-files)

The objective is to be able to include external file by using the syntax below:

````markdown
```{.bash include="documentation/chapter_1/install.sh"}
```
````

Make sure to add lines below in your YAML front matter:

<Snippet filename="test.md">

```yaml
filters:
   - include-code-files
```

</Snippet>

## quarto-ext/search-replace

See [https://github.com/ute/search-replace](https://github.com/ute/search-replace)

Quarto filter extension for simple search-replace macros.

This extension allows to search and replace when rendering documents. For instance, by putting the `+quarto` code in the frontmatter of the article or, better, in the `_quarto.yaml` global file, we can just write `+quarto` (a constant) in our document and let the replace action be done during the rendering of the documentation.

<Snippet filename="_quarto.yaml" source="./files/_quarto.yaml" />

Make sure to add lines below in your YAML front matter:

```yaml
filters:
   - search-replace
```

### Example

Below how to use it. It's simple; just write the name of your constant and during the rendering of your document, the constant will be replaced by the predefined value. Easy!

```markdown
I'm using +quarto and I love it
```

## shafayetShafee/code-fullscreen

See [https://github.com/shafayetShafee/code-fullscreen](https://github.com/shafayetShafee/code-fullscreen)

This extension is for revealjs slideshow.

If you have a very long block of code, revealjs will not display all lines and thus, the code will be truncated (like only the first 25 lines will be displayed).

By adding the filter below to your YAML frontmatter, a small *Full screen* button will be displayed at the top right of the block code.

<Snippet filename="test.md">

```yaml
filters:
   - code-fullscreen
```

</Snippet>
