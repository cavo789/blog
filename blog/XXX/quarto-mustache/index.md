---
slug: quarto-mustache
title: Using Mustache templating with Quarto
authors: [christophe]
image: /img/quarto_tips_social_media.jpg
tags: [markdown, mustache, quarto]
enableComments: true
draft: true
---

<!-- cspell:ignore buie,frontmatter -->

![Using Mustache templating with Quarto](/img/quarto_tips_banner.jpg)

I use Quarto to generate documentation; until now I've mainly generated `.docx` and `.pdf` files.

Recently, I needed to generate a website (HTML) that would allow my colleagues to consult the documentation for the latest software I've written. I had to describe nearly 80 functions: as many web pages to write, each with the same structure (a description chapter, a how to run chapter, a how to configure chapter, etc.).

And immediately, when you put it like that, you think of a CMS (content management system) such as Joomla for example, i.e. being able to define a standard page (a template) that will include the chapters and in each chapter, you could imagine injecting content that would be variables. Wouldn't it be silly to write each page by hand?

And this is where [Mustache](https://mustache.github.io/)'s idea comes in. Mustache defines himself as a *Logic-less templates* framework.

And, because I'm using Quarto for my documentation, I need an extension for using Mustache and it's [Quarto-partials](https://github.com/gadenbuie/quarto-partials/tree/main) from [Garrick Aden-Buie](https://github.com/gadenbuie).

<!-- truncate -->

## Let's discover the basics

The idea behind Quarto-partials is to allow to write a page like below i.e. I'll describe my first functionality and, in the `How to run` chapter, I'll inject the content of another page:

<details>
<summary>/documentation/feature_1.md</summary>

```markdown
## How to run

{{< partial ../_partials/run/cli.md >}}
```

</details>

The `../_partials/run/cli.md` is a standard markdown file. In my case, I want to be dynamic and for this, I'll use a variable:

<details>
<summary>../_partials/run/cli.md</summary>

```markdown
In order to run this action, please run `{{ command }}`.
```

</details>

Here comes Mustache in action: as you can see, the syntax `{{ command }}` will output the content of a variable called `command`. Of course, I need to declare it. Let's review my documentation and add what Quarto call a *frontmatter* YAML block:

<details>
<summary>/documentation/feature_1.md</summary>

```markdown
<!-- highlight-start -->
---

partial-data:
  command: "run feature_1"

---
<!-- highlight-end -->

## How to run

{{< partial ../_partials/run.md >}}
```

</details>

And now, we're ready to copy/paste the file `/documentation/feature_1.md` to `/documentation/feature_2.md` and just update the command variable. And do this again and again until we've documented all features.

<details>
<summary>/documentation/feature_2.md</summary>

```markdown
<!-- highlight-start -->
---

partial-data:
  command: "run feature_2"

---
<!-- highlight-end -->

## How to run

{{< partial ../_partials/run.md >}}
```

</details>

In my own case, my documentation looks like this:

<details>
<summary>/documentation/php_lint.md</summary>

```markdown
---

title: PHP linter
categories: [linting, php]
order: 1
partial-data:
  command: "lint-php"
  config_file: ".phplint.yml"
  config_url: "https://github.com/tengattack/phplint/blob/master/.phplint.yml"
  constant: "PHPLINT"
  type: "PHP"

---

<!-- cspell:ignore phplint -->

## Description

This is a brief description of the functionality. This text is hardcoded because it is different each time, from one feature to another.

## For what type of project

{{< partial ../_partials/project_type.md >}}

## How to run

{{< partial ../_partials/run/cli.md >}}

## How to configure

{{< partial ../_partials/configure/file.md >}}

## Attention points

None.

## Remarks

None.
```

</details>

## Testing if a variable is defined or not

Let's take a look to the `is_for.md` file.

<details>
<summary>/_partials/project_type.md</summary>

```markdown
<!-- #type means defined and thus has been set to something like "PHP" or "PYTHON" -->
{{#type}}

This job only for **{{ type }}** project.

{{/type}}

<!-- ^type means empty/missing so, in this case, the command is for all type of projects -->
{{^type}}

This stage is for **all** type of projects.

{{/type}}
```

</details>

There is two syntax used here: `{{#` and `{{^`.

The first one will check the presence of a variable called `type` and if that one is defined, the block will be processed. 

The second one is called *Inverted section* and will check the absence of the variable so if `type` is not defined, that block will be parsed.

If you look at my `php_lint.md` file, I've well a variable `type` defined in my `partial-data` section (the one used by Quarto-partials).

<details>
<summary>/documentation/php_lint.md</summary>

```markdown
---

title: PHP linter
categories: [linting, php]
order: 1
<!-- highlight-next-line -->
partial-data:
  command: "lint-php"
  config_file: ".phplint.yml"
  config_url: "https://github.com/tengattack/phplint/blob/master/.phplint.yml"
  name: "PHP Linter"
  <!-- highlight-next-line -->
  type: "PHP"
  
---

<!-- cspell:ignore phplint -->

## Description

This is a brief description of the functionality. This text is hardcoded because it is different each time, from one feature to another.

## For what type of project

{{< partial ../_partials/project_type/is_for.md >}}

## How to run

{{< partial ../_partials/run/cli.md >}}

## How to configure

{{< partial ../_partials/configure/file.md >}}

## Attention points

None.

## Remarks

None.
```

</details>

If I render my file using the command line `quarto render`, I'll then see `This job only for **PHP** project.` in my documentation.

In case my feature was for all project types, I can just remove the `type: "PHP"` line from my frontmatter. In that case, I'll see `This stage is for **all** type of projects.`.

Let's take a look to the next included file:

<details>
<summary>../_partials/configure/file.md</summary>

```markdown
<!-- #config_file means defined and thus there is a configuration file -->
{{#config_file}}

{{ name }} uses a settings file named .config/{{ config_file }} ([learn more]({{ config_url }})).

{{/config_file}}

<!-- ^config_file means empty/missing so no configuration file -->
{{^config_file}}

There is no configuration file.

{{/config_file}}

```

</details>

Same idea. If a `config_file` key is defined in the documentation frontmatter, we'll obtain `PHP Linter uses a settings file named .config/.phplint.yml ([Learn more](https://github.com/tengattack/phplint/blob/master/.phplint.yml)).`. If we remove the `config_file` line, we'll then get `There is no configuration file.`.

## Raw contents

When displaying a variable, sometimes we need to disable the normal echo mode and use what Mustache call `raw content`.

In the example below, I've used a character `/` that will be escaped by Mustache.

```yaml
partial-data:
  output: ".output/coverage"
```

```markdown
{{#output}}

The report will be created into your project's directory in a folder called `{{ output }}`.

{{/output}}
```

The HTML rendering here will return `.output&#x2F;coverage` and not `.output/coverage` as expected. As we can see, Mustache has escape our slash. So, we've to use the raw content mode and use the `{{& output }}` syntax instead.

```markdown
{{#output}}

The report will be created into your project's directory in a folder called `{{& output }}`.

{{/output}}
```
