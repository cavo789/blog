---
slug: compare-env-files-cli
title: Compare environment files in the Linux console
date: 2024-01-26
description: Struggling to sync your .env and .env.example files? Learn a powerful Linux CLI command using diff, grep, and sort to accurately compare environment variables and skip comments.
authors: [christophe]
image: /img/v2/bash.webp
mainTag: linux
tags:
  - bash
  - docker
  - linux
language: en
review_date: 2026-07-30
---
![Compare environment files in the Linux console](/img/v2/bash.webp)

<TLDR>
This article shows a Linux one-liner to reliably compare two `.env` files (e.g. `.env` vs `.env.example`) using `diff -y --suppress-common-lines` combined with `grep` and `sort`, so comments, blank lines, and line order are ignored and specific variables (like `APP_KEY`) can be excluded from the comparison.
</TLDR>

This is a very common source of problems using .env files: you have two or more different `.env` files like `.env` and `.env.example`.

You're a programmer and coding a new amazing feature. You're adding one or more new environment variables to your local `.env` file and everything is working fine **on your computer**.

<AlertBox variant="danger" title="Boum! Your feature is buggy.">
A colleague copies the source code from a version-control system like GitHub/GitLab, or, second scenario, someone deploys the feature to a server — and your feature breaks.

</AlertBox>

Why? Because the variable(s) you've added have been added in **your local `.env`** file, on **your computer only**.

As you know, you have to create the variables in the `.env.example` file too but let's be honest, nobody thinks about it.

*Two companion articles: <Link to="/blog/update-env-files-cli">Batch edit of environment file</Link> once you've found the missing keys, and <Link to="/blog/bash-load-env">Bash - Loading environment variables from a file</Link> to consume them in your scripts.*

<!-- truncate -->

There are some tools that allow comparing two files like `diff` (see <Link to="/blog/linux-diff-file-folder">Linux - Comparing two folders/files in the console</Link> for the general case) but not really the best here since:

1. We don't care about comments and empty lines. If a variable has been commented, we just need to ignore it.
2. We don't care about the position in the file where the variable is declared. If `APP_ENV = local` is on the first line, in the middle of the file or just before the last line, we don't care about it.
3. We can also ignore some variables that we know should be different, like `APP_KEY` f.i.

Let's try... Below we'll create the file `.env.example` with two lines then copy it to `.env` and just add a new line in `.env.example`. Finally, we'll sort `.env.example` so the order will differ with `.env`.

<Terminal typewriter source="./files/terminal-1.txt" />

Now that we have our two files with some differences, we can run this command:

```bash
(
  clear
  ENV1=.env
  ENV2=.env.example
  printf "\e[33;1m%-63s %s\e[0;1m\n" "Left side: ${ENV1}" "Right side: ${ENV2}"
  diff --suppress-common-lines -y \
    <(grep -v -E '^#|^$' ${ENV1}| sort) \
    <(grep -v -E '^#|^$' ${ENV2} | sort) \
   | grep -v 'APP_KEY'
)
```

`diff` will compare the two files, but not directly the files themselves — rather their content, after we've first removed empty and commented lines and sorted the lines.

The flag `--suppress-common-lines -y` will display the result in two columns (`-y`) and only differences (`--suppress-common-lines`).

Once the `diff` is made, the command ignores the `APP_KEY` variable (in our example); so, yes, the expected result is:

```diff
Left side: .env                   Right side: .env.example
                                > CACHE_DRIVER = redis
```

For the illustration, we can now add a new key but just in `.env` (real world situation: I'm coding a new feature and I add a variable like a switch on/off)

<Terminal typewriter>
$ echo 'ALLOW_FEATURE_DO_THIS = true' >> .env
</Terminal>

Now the output will be:

```diff
Left side: .env                   Right side: .env.example
ALLOW_FEATURE_DO_THIS = true    <
                                > CACHE_DRIVER = redis
```

The column on the left represents the first file (in our example `.env`) while the column on the right is for the second file (`.env.example`).

Last sample:

<Terminal typewriter>
$ echo 'DATABASE_TYPE = pgsql' >> .env
$ echo 'DATABASE_TYPE = mysql' >> .env.example
</Terminal>

And the result of the `diff` command:

```diff
Left side: .env                   Right side: .env.example
ALLOW_FEATURE_DO_THIS = true    <
DATABASE_TYPE = pgsql           | CACHE_DRIVER = redis
                                > DATABASE_TYPE = mysql
```

How to read:

- `ALLOW_FEATURE_DO_THIS` is only present in `.env`,
- `DATABASE_TYPE` is initialized to `pgsql` in `.env` and to `mysql` in `.env.example`,
- `CACHE_DRIVER` is only present in `.env.example` and
- all other lines are strictly identical (remember we've ignored commented and empty lines)
