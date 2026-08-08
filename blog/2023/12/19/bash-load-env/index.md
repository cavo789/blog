---
slug: bash-load-env
title: Bash - Loading environment variables from a file
date: 2023-12-19
description: Learn how to load environment variables from a .env file into a Bash script, so you can externalize configuration and reuse variables across other applications like Laravel.
authors: [christophe]
image: /img/v2/bash.webp
series: Writing better Bash scripts
mainTag: bash
tags:
  - bash
  - linux
language: en
review_date: 2026-07-30
---
![Bash - Loading environment variables from a file](/img/v2/bash.webp)

<TLDR>
This article shows the correct way to load a `.env` file's variables into a Bash script's environment: `set -o allexport; source .env; set +o allexport`, which handles values containing spaces correctly — unlike the common but unreliable `export $(... | xargs)` pattern.
</TLDR>

Imagine you have a `.env` file like this one and you wish to process that file in a Bash script.

<Snippet filename=".env" source="./files/.env" />

Using a configuration file will enable you to externalize the management of your constants, as well as reuse variables from another application, such as a site developed in Laravel.

Let's take a look at how to do this as correctly as possible.

<!-- truncate -->

The snippet comes from [https://gist.github.com/mihow/9c7f559807069a03e302605691f85572?permalink_comment_id=3954807#gistcomment-3954807](https://gist.github.com/mihow/9c7f559807069a03e302605691f85572?permalink_comment_id=3954807#gistcomment-3954807)

You can load that file easily in your environment using the following instructions:

```bash
set -o allexport
source .env
set +o allexport
```

This done, variables will be accessible like any environment variables in your bash script. When the script exits, the added variables are removed (just like in a sub-shell).

Using source is the best solution to avoid problems with f.i. spaces like in *Me and myself* i.e. using other solutions like `export $(... | xargs)` will always give unpredictable results.

To illustrate this, simply create a file called f.i. `test.sh` with this content:

<Snippet filename="test.sh" source="./files/test.sh" />

Using the `.env` file provided here above, we'll obtain this output:

<Terminal typewriter>
$ ./test.sh
Christophe Avonture (christophe@me.com)
</Terminal>

This is, I think, the best and, too, the easiest way to use an external file to store configuration items in Bash.

Two more `.env` companions from this blog: <Link to="/blog/compare-env-files-cli">Compare environment files in the Linux console</Link>, to spot the key you forgot to report from `.env.example`, and <Link to="/blog/update-env-files-cli">Batch edit of environment file</Link>, to change the same variable in a dozen projects at once.
