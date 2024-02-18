---
slug: docker-init-postgresql
title: Docker init now supports PHP
authors: [christophe]
image: ./images/social_media.jpg
tags: [docker, tips]
draft: true
enableComments: true
---
:::danger
IL S'AGIT D'UN ARTICLE QUE J'AI PUBLIÉ LE 7 DÉCEMBRE MAIS, LORS DE LA PUBLICATION, JE N'AI PAS MIS LA SECONDE PARTIE CONCERNANT POSTGRESQL.

PEUT-ÊTRE LORDQUE JE REPRENDRAIS CET ARTICLE-CI; docker-init SERA PLUS ÉVOLUÉ.
:::

/////////////////////////////////////////////////////////////////////////////////

![Docker init now supports PHP](./images/social_media.jpg)

But what a happy and strange coincidence. In its new version (4.26) released yesterday (on my birthday), Docker adds support for PHP+Apache to its `docker init` instruction. Let's see how this translates into a practical case.

<!-- truncate -->

> The official blog post: [https://www.docker.com/blog/docker-desktop-4-26/]

Please start a Linux shell and run `mkdir -p /tmp/docker-init && cd $_` to create a folder called `docker-init` in your Linux temporary folder and jump in it.

Now, in your console, just run `docker init` and follow the wizard.

```bash
❯ docker init

Welcome to the Docker Init CLI!

This utility will walk you through creating the following files with sensible defaults for your project:
  - .dockerignore
  - Dockerfile
  - compose.yaml
  - README.Docker.md

Let's get started!

? What application platform does your project use?  [Use arrows to move, type to filter]
  Go - suitable for a Go server application
  Python - suitable for a Python server application
  Node - suitable for a Node server application
  Rust - suitable for a Rust server application
  ASP.NET Core - suitable for an ASP.NET Core application
> PHP with Apache - suitable for a PHP web application
  Other - general purpose starting point for containerizing your application
  Don't see something you need? Let us know!
  Quit
```

Make sure to select `PHP with Apache - suitable for a PHP web application`.

For the next questions:

* `What version of PHP do you want to use?`, please enter f.i. `8.2`,
* `What's the relative directory for your app?`, just press enter to select the current directory,
* `What local port do you want to us to access your server?`, just press enter to use the proposed port number or f.i. enter `8080`.

```bash

? What application platform does your project use? PHP with Apache
? What version of PHP do you want to use? 8.2
? What's the relative directory (with a leading .) for your app?
? What local port do you want to use to access your server? 8080

CREATED: .dockerignore
CREATED: Dockerfile
CREATED: compose.yaml
CREATED: README.Docker.md

✔ Your Docker files are ready!

Take a moment to review them and tailor them to your application.

If your application requires specific PHP extensions, you can follow the instructions in the Dockerfile to add them.

When you're ready, start your application by running: docker compose up --build

Your application will be available at http://localhost:8080

Consult README.Docker.md for more information about using the generated files.
```

The wizard is quite straigth-forward but, then, we got four files.

Two are really important right now: `compose.yaml` and `Dockerfile`.

## compose.yaml

By opening `compose.yaml` with Visual Studio Code, you'll see a lot of comments.

By default, everything is commented except:

```yaml
services:
  server:
    build:
      context: .
    ports:
      - 8080:80
```

Ok, that just means that we'll not use a standard, pre-existing, Docker image but we'll build yours and the definition of that image is located in the current folder (`context: .`). The definition of your Docker image has to be written in the, standard, `Dockerfile`.

The second thing we see here is the port number we've choosen. The Docker container will be published on the port `8080`.

## Dockerfile

Here too, `docker init` has created a file with a lot of comments. If we remove them, here is the non-commented lines:

```dockerfile
FROM php:8.2-apache
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"
COPY . /var/www/html
USER www-data
```

:::danger Bug in Docker 4.26 - Docker init - PHP + Apache
There is a bug in the release `4.26`, the `COPY` statement has to be `COPY . /var/www/html` (i.e. we need to specify the source folder `.`). I've created an issue on the Docker repositoriy ([https://github.com/docker/cli/issues/4702](https://github.com/docker/cli/issues/4702))

Please update the file `Dockerfile` and change the line `COPY /var/www/html` to `COPY . /var/www/html`
:::

So, we can see we'll use the `php:8.2-apache` image (since we've asked for PHP `8.2`), we'll copy the content of your current folder (`.`) to the `/var/www/html` folder inside the Docker image, we'll also use the `php.ini` file for production and will switch the current Linux user used inside the container to `www-data`.

## Run the container

Ok, nothing really difficult until now. We'll create the image by running `docker compose up --build`.

Once built, we can surf to `http://localhost:8080` and ... ouch.

![Forbidden](./images/forbidden.png)

**And this is totally normal.** Remember, your current folder only contains actually the four files created by `docker init`.

Please create the `index.php` file with this content:

```php
<?php

phpinfo();
```

Go back to your console, press <kbd>CTRL</kbd>-<kbd>C</kbd> to stop the first container and run `docker compose up --detach --build` this time (so the console won't be blocked and the container stay running in background).

![phpinfo](./images/phpinfo.png)

## Enter in the container

We'll start an interactive shell in the container. We just need to know how the container is named.

Back to the `compose.yaml` file, we can retrieve the name of the container; it's ne name of the service: `server` in this case.

```yaml
services:
  // highlight-next-line
  server:
    [...]
```

To run an interactive shell, please run the following command:

```bash
❯ docker compose exec server /bin/bash

www-data@86e3fd14ea18:~/html$
```

As expected, you're now inside the container. You can display the list of files by running `ls -alh`

```bash
www-data@86e3fd14ea18:~/html$ ls -alh

total 20K
drwxrwxrwt 1 www-data www-data 4.0K Dec  7 17:52 .
drwxr-xr-x 1 root     root     4.0K Nov 21 17:46 ..
-rw-r--r-- 1 root     root      742 Dec  7 17:34 README.Docker.md
-rw-r--r-- 1 root     root       17 Dec  7 17:49 index.php
```

So, even if your current folder, on your machine, contains now five files, only `README.Docker.md` and `index.php` are present. Why not the other files?

## .dockerignore

On your machine, we've thus five files:

```bash
❯ ls -alh

total 36K
drwxr-xr-x  2 christophe christophe 4.0K Dec  7 17:59 .
drwxrwxrwt 32 root       root        12K Dec  7 17:59 ..
-rw-r--r--  1 christophe christophe  646 Dec  7 17:34 .dockerignore
-rw-r--r--  1 christophe christophe 2.3K Dec  7 17:03 Dockerfile
-rw-r--r--  1 christophe christophe  742 Dec  7 17:34 README.Docker.md
-rw-r--r--  1 christophe christophe 1.7K Dec  7 17:34 compose.yaml
-rw-r--r--  1 christophe christophe   17 Dec  7 17:49 index.php
```

And only `README.Docker.md` and `index.php` have been copied into the container.

The reason is: the other files have been ignored because they have been mentioned in the `.dockerignore` file.

```text
# Include any files or directories that you don't want to be copied to your
# container here (e.g., local build artifacts, temporary files, etc.).
#
# For more help, visit the .dockerignore file reference guide at
# https://docs.docker.com/go/build-context-dockerignore/

**/.classpath
//highlight-next-line
**/.dockerignore
**/.env
**/.git
**/.gitignore
**/.project
**/.settings
**/.toolstarget
**/.vs
**/.vscode
**/.next
**/.cache
**/*.*proj.user
**/*.dbmdl
**/*.jfm
**/charts
**/docker-compose*
//highlight-next-line
**/compose*
!**/composer.json
!**/composer.lock
//highlight-next-line
**/Dockerfile*
**/node_modules
**/npm-debug.log
**/obj
**/secrets.dev.yaml
**/values.dev.yaml
**/vendor
LICENSE
README.md
```

## Adding support for PostgreSQL

We need to make three changes:

* Declare a database service in `compose.yaml`,
* We need to add the pgsql PHP module in our Docker image; this in `Dockerfile` and
* We'll update our `index.php` script to get the list of databases in our PostgreSQL server.

### Step 1 - compose.yaml

Please open the `compose.yaml` once again and replace his content by this one:

```yaml
services:
  server:
    build:
      context: .
    ports:
      - 8080:80
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres
    restart: always
    user: postgres
    secrets:
      - db-password
    volumes:
      - db-data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=example
      //highlight-next-line
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD_FILE=/run/secrets/db-password
    expose:
      - 5432
    //highlight-next-line
    ports:
      //highlight-next-line
      - 5432:5432
    healthcheck:
      test: [ "CMD", "pg_isready" ]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  db-data:

secrets:
  db-password:
    file: db/password.txt
```

:::danger Think to create the db/password.txt file
Please create the /db/password.txt` file with this content:

```text
postgres
```

:::

### Step 2 - Dockerfile

We also need to edit your `Dockerfile` and add PostgreSQL support. Please open your `Dockerfile` and replace his content by this one:

```Dockerfile
FROM php:8.2-apache

RUN apt-get update -yqq && apt-get install -y libpq-dev \
    && docker-php-ext-configure pgsql -with-pgsql=/usr/local/pgsql \
    && docker-php-ext-install pdo pdo_pgsql pgsql \
    && apt-get clean \
    && rm -rf /tmp/* /var/list/apt/*

RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

COPY . /var/www/html

USER www-data
```

So now, we'll still have your Docker PHP container but we'll also add a new one, a PostgreSQL database server. Like this, your PHP script will be able to work with a database.

### Step 3 - index.php

And finally, just for the illustration, also update your `index.php` file with this content:

```php
<?php

$host = "localhost";
$port = "5432";
$database = "";
$user = "postgres";
$password = "postgres";

$connection = pg_connect("host=$host port=$port dbname=$database user=$user password=$password");

if (!$connection) {
    die("Database connection error : " . pg_last_error());
}

$query = "SELECT dbname FROM pg_database";
$result = pg_query($connection, $query);

if (!$result) {
    die("Query execution error : " . pg_last_error());
}

echo "<h1>List of databases</h1>";
echo "<ul>";

while ($row = pg_fetch_assoc($result)) {
    echo "<li>" . $row['dbname'] . "</li>";
}

echo "</ul>";

pg_close($connection);
```

### Run the PHP script

The first thing to do is to kill the previous Docker container, remove his attached volumes and rebuild things, the one-liner for this is: `docker compose down --volumes && docker compose up --detach --build`.

You'll see that, during the build phase, PostgreSQL (pgsql) will be installed in your Docker PHP image.

:::tip Optional, access to your PostgreSQL using adminer interface
You can start adminer by running `docker run -d --rm --name adminer --link db --network docker-init_default -p 8089:8080 adminer` then surf to `http://localhost:8089?pgsql=db:5432&username=postgres&db=example`. Password to use is `postgres` as defined in your `db/password.txt` file.

Be careful, the name of the network can vary. It's `docker-init_default` here because your current folder has been named `docker-init`.

![Run Adminer](./images/adminer.png)
:::

So, let's try again `http://localhost:8080` and tadaaa...

![PostgreSQL - List of databases](./images/pgsql_list_of_databases.png)

We have reached the end of this article. We've used the `docker init` instruction to create the bare essentials needed to run a PHP script in an Apache container and we've adapted the files to add PostgreSQL support.
