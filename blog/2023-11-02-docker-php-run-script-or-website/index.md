---
slug: docker-php-run-script-or-website
title: The easiest way to run a PHP script / website
authors: [christophe]
tags: [wsl, docker, php]
---
# The easiest way to run a PHP script / website

The situation: you wish to run a piece of standard PHP code (no dependency) like the one below:

```php
<?php

echo "<h2>Incorrect, silent bug</h2>";

print_r(json_decode(utf8_decode("Ipso lorem"), true));

echo "<h2>Incorrect, we got an exception</h2>";

print_r(json_decode(utf8_decode("Ipso lorem"), true, 512, JSON_THROW_ON_ERROR));
```

The easiest way is to:

* Create a temporary directory like `mkdir /tmp/snippet && /tmp/snippet`,
* Create an `index.php` file there (with your snippet like here above),
* Run this command in the console: `docker run -d -p 8080:80 -u ${UID}:${GID} -v "$PWD":/var/www/html php:7.4-apache` and,
* Surf to `http://127.0.0.1:8080`.

It's done.

Explanations for the `docker run -d -p 8080:80 -v "$PWD":/var/www/html php:7.4-apache` command:

* We wish to make the local website accessible on port 8080 (so `http://127.0.0.1:8080`),
* We wish to synchronize the current folder (i.e. `/tmp/snippet`) with the Docker container so changes in any file in `/tmp/snippet` will be immediately reflected in Docker and thus in your browser,
* And we wish to use `php:7.4-apache`. Just replace with `php:8.2-apache` to switch to PHP 8.2 f.i.