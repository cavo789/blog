---
slug: markdown-lint
title: Markdown linter - solve formatting issue in md files
date: 2024-02-03
description: Automatically solve Markdown formatting issues with the markdownlint tool and Docker. Learn how to check, configure, and use the --fix flag for consistent, clean .md files.
authors: [christophe]
image: /img/v2/clean_code.webp
series: code quality
mainTag: code-quality
tags: [code-quality, makefile, markdown, tips, vscode]
language: en
---
![Markdown linter - solve formatting issue in md files](/img/v2/clean_code.webp)

You are writing Markdown `.md` files (and you're so right) and you just wish to check (and autofix) some issues like having multiple blank lines, mixing bullet types (`-` and `*` in the same document), using a `#` title followed by `###` (i.e. you forget the level `##`) and many more.

There is a tool for this: Markdown lint and, a Docker image `peterdavehello/markdownlint`.

Let's learn how to use it.

<!-- truncate -->

By running `docker run --rm -v .:/md peterdavehello/markdownlint markdownlint .` you'll scan your current folder (recursively), search for any Markdown files and get the list of errors if any.

And the list can be huge if you're using dependencies like, for PHP, the `vendor` folder or `node_modules` for npm/yarn. Just ignore them

## Ignore some files/folders

Create a file called `.markdownlint_ignore` in the root directory of your project with this content:

<Snippet filename=".markdownlint_ignore" source="./files/.markdownlint_ignore" />

This time, please run `docker run --rm -v .:/md peterdavehello/markdownlint markdownlint --ignore-path .markdownlint_ignore .`.

The list will probably be better and only contains your files.

## Ignore some errors

You can ignore some detected errors like the use of inline HTML by creating a file called `.markdownlint.json`. You can find an example on [https://github.com/DavidAnson/markdownlint/blob/main/.markdownlint.json](https://github.com/DavidAnson/markdownlint/blob/main/.markdownlint.json). See [https://github.com/DavidAnson/markdownlint/blob/main/doc/Rules.md](https://github.com/DavidAnson/markdownlint/blob/main/doc/Rules.md) for more information.

To use your configuration file, now, please run `docker run --rm -v .:/md peterdavehello/markdownlint markdownlint --config .markdownlint.json --ignore-path .markdownlint_ignore .`.

## Some errors can be fixed automagically

Some errors can be fixed automagically like multiple empty lines or by trimming extra spaces at the end of lines.

The flag here is `--fix` but, pay attention, since fixes will update files you should also provide the `--user $(id -u):$(id -g)` flag so files will be updated but will still be owned by you.

## Put all together

The final instruction becomes : `docker run --rm --user $(id -u):$(id -g) -v .:/md peterdavehello/markdownlint markdownlint --fix --config .markdownlint.json --ignore-path .markdownlint_ignore .` and that's the one I'm running every time when I publish this blog.

## Make it easy

You don't need to remember the entire command of course. Using a <Link to="/blog/tags/makefile">Makefile</Link> in your project, you can then create a new `target` where you put the command.

For this blog f.i., I'm running `make lint` in my deploy process. You can see this [here](https://github.com/cavo789/blog/blob/main/makefile#L42-L45).