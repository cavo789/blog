---
slug: docker-php-run-script-or-website
title: The easiest way to run a PHP script / website
date: 2023-11-02
description: The easiest way to run a standard PHP script or website instantly using Docker. Just one docker run command and your code is live for quick testing.
authors: [christophe]
image: /img/v2/php_tips.webp
mainTag: php
tags: [wsl, docker, php]
language: en
---
![The easiest way to run a PHP script / website](/img/v2/php_tips.webp)

The situation: you wish to run a piece of standard PHP code (no dependency) like the one below:

<Snippet filename="index.php" source="./files/index.php" />

<!-- truncate -->

The easiest way is to:

* Create a temporary directory like `mkdir /tmp/snippet && cd $_`,
* Create an `index.php` file there (with your snippet like here above),
* Run this command in the console: `docker run -d -p 8080:80 -u ${UID}:${GID} -v "$PWD":/var/www/html php:7.4-apache` and,
* Surf to `http://127.0.0.1:8080`.

It's done.

Explanations for the `docker run -d -p 8080:80 -v "$PWD":/var/www/html php:7.4-apache` command:

* We wish to make the local website accessible on port 8080 (so `http://127.0.0.1:8080`),
* We wish to synchronize the current folder (i.e. `/tmp/snippet`) with the Docker container so changes in any file in `/tmp/snippet` will be immediately reflected in Docker and thus in your browser,
* And we wish to use `php:8.2-apache`. Just replace with f.i. `php:7.4-apache` to switch to an older version.
