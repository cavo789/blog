---
slug: bash-load-env
title: Bash - Loading environment variables from a file
authors: [christophe]
image: /img/bash_tips_social_media.jpg
tags: [bash, tips]
enableComments: true
---
![Bash - Loading environment variables from a file](/img/bash_tips_banner.jpg)

Imagine you've a `.env` file like and you wish to process that file in a Bash script.

```env
DOCKER_GIT_USEREMAIL="christophe@me.com"
DOCKER_GIT_FULLNAME="Christophe Avonture"
DOCKER_GIT_USERNAME="Me and myself"
```

Using a configuration file will enable you to externalize the management of your constants, as well as reuse variables from another application, such as a site developed in Laravel.

Let's take a look at how to do this as correctly as possible.

<!-- truncate -->

The snippet comes from [https://gist.github.com/mihow/9c7f559807069a03e302605691f85572?permalink_comment_id=3954807#gistcomment-3954807](https://gist.github.com/mihow/9c7f559807069a03e302605691f85572?permalink_comment_id=3954807#gistcomment-3954807)

You can load that file easily in your environment using the following instructions:

```bash
set -o allexport
source .env set
set +o allexport
```

This done, variables will be accessible like any environment variables in your bash script. When the script exit, the added variables are removed (just like in a sub-shell).

Using source is the best solution to avoid problems with f.i. spaces like in *Me and myself* i.e. using other solutions like `export $(... | xargs)` will always give unpredictable results.

To illustrate this, simply create a file called f.i. `test.sh` with this content:

```bash
#!/usr/bin/env bash

set -o allexport
source .env set
set +o allexport

echo "${DOCKER_GIT_FULLNAME} (${DOCKER_GIT_USEREMAIL})"
```

Using the `.env` file provided here above, we'll obtain this output:

```bash
❯ ./test.sh

Christophe Avonture (christophe@me.com)
```

This is, I think, the best and, too, the easiest way to use an external file to store configuration items in Bash.
