---
slug: docker-php-run-script-or-website
title: The easiest way to run a PHP script / website
date: 2023-11-02
description: The easiest way to run a standard PHP script or website instantly using Docker. Just one docker run command and your code is live for quick testing.
authors: [christophe]
image: /img/v2/php_tips.webp
mainTag: php
tags:
  - docker
  - php
  - wsl
language: en
updates:
  - date: 2026-07-30
    note: "Updated PHP image from php:8.3-apache (EOL Dec 2022) to php:8.3-apache."
---
![The easiest way to run a PHP script / website](/img/v2/php_tips.webp)

<TLDR>
This article shows the fastest way to run a standard PHP script or site locally: drop the code into a folder and run `docker run -d -p 8080:80 -u ${UID}:${GID} -v "$PWD":/var/www/html php:8.3-apache`, then browse to `http://127.0.0.1:8080` — no local PHP or Apache install needed, and swapping the image tag switches PHP versions instantly.
</TLDR>

Imagine this situation: you wish to run a piece of standard PHP code (no dependency) like the one below:

<Snippet filename="index.php" source="./files/index.php" />

<!-- truncate -->

The easiest way is to:

- Create a temporary directory with `mkdir /tmp/snippet && cd $_`,
- Create an `index.php` file there (with your snippet like above),
- Run this command in the console: `docker run -d -p 8080:80 -u ${UID}:${GID} -v "$PWD":/var/www/html php:8.3-apache` and,
- Browse to `http://127.0.0.1:8080`.

It's done.

Explanations for the `docker run -d -p 8080:80 -u ${UID}:${GID} -v "$PWD":/var/www/html php:8.3-apache` command:

- We wish to make the local website accessible on port 8080 (so `http://127.0.0.1:8080`),
- We wish to synchronize the current folder (i.e. `/tmp/snippet`) with the Docker container so changes in any file in `/tmp/snippet` will be immediately reflected in Docker and thus in your browser,
- And we wish to use `php:8.3-apache`. Just replace with e.g. `php:8.4-apache` to switch to a newer version.

Three things you'll want next: <Link to="/blog/docker-php-ini">Update php.ini when using a Docker image</Link> when the default settings are too tight, <Link to="/blog/docker-init">Docker init now supports PHP</Link> to turn this one-liner into a real `Dockerfile` + `compose.yaml`, and <Link to="/blog/php-jakzal-phpqa">jakzal/phpqa</Link> to run every PHP quality tool on that code — still without installing anything.

*For a site with no PHP at all, <Link to="/blog/docker-html-site">Running an HTML site in seconds using Docker</Link> is the even lighter version.*
