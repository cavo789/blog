---
slug: docker-joomla-2024
title: Create your Joomla website using Docker - Q3/2024
authors: [christophe]
image: ./images/social_media.jpg
tags: [adminer, apache, docker, joomla, makefile, mysql, phpmyadmin, postgresql, vscode, wsl]
enableComments: true
---
![Create your Joomla website using Docker - Q3/2024](./images/header.jpg)

<!--cspell:ignore runningjoomlaindocker, mysqli -->

At the end of 2023, I wrote a long post about using Joomla with Docker. If you're new to this, I invite you to take the time to (re)read the article ([Create your Joomla website using Docker](/blog/docker-joomla)), so you'll understand what Docker is, what a container is, what volumes are, how to make data persistent, ...

As Docker and Joomla are evolving rapidly, I propose here to start from where we were and see what has changed since then.

<!-- truncate -->

This year, instead of proposing an example that we'll improve little by little, let's start immediately with a set of files that will enable you to create your Joomla project with Docker.

## Prerequisites

### Our orchestration file: `compose.yaml`

We need a file that will explain to Docker how we want to configure Joomla and, also, the type of database we want.

Our orchestration file will also inform Docker that we want the Joomla site to be persistent, i.e. the files to be saved on our hard disk. The same applies to the database. We need to do this so that, if we *kill* the Docker container, the files are saved on disk (otherwise everything would be lost).

There are two types of persistence, the one managed natively by Docker (*intern volumes*) or the one where we'll see the files in our project. We'll opt for the latter. See my article [Using volumes with Docker, use cases](/blog/docker-volumes) if you want to learn more.

We're also going to define a dependency: Joomla must wait for the database server to be ready before starting its installation (in fact, if the Joomla installer tries to access MySQL before the system is even loaded, our project will crash during container loading).

As you can see, our `compose.yaml` file is of paramount importance for the proper definition of our project.

:::note
In recent months, the name of the file to be used has changed from `docker-compose.yml` to `compose.yaml`; still supported for now, but might as well use the new name.
:::

Please create a new folder (f.i. `mkdir /tmp/docker && cd $_`) on your hard disk and create the `composer.yaml` file with this content:

```yaml
name: ${PROJECT_NAME:-yourprojectname}

services:
  joomla:
    image: joomla:${JOOMLA_VERSION:-latest}
    container_name: ${CONTAINER:-project}-app
    restart: always
    ports:
      - ${WEB_PORT-:8080}:80
    environment:
      - JOOMLA_DB_HOST=joomladb
      - JOOMLA_DB_PASSWORD=${DB_PASSWORD:-examplepass}
    depends_on:
      joomladb:
        condition: service_healthy
    user: ${UID}:${GID}
    volumes:
      - ./site_joomla:/var/www/html
    networks:
      - joomla_network

  joomladb:
    image: mysql:${MYSQL_VERSION:-latest}
    container_name: ${CONTAINER:-project}-db
    restart: always
    ports:
      - ${MYSQL_PORT-:3306}:3306
    environment:      
      - MYSQL_RANDOM_ROOT_PASSWORD='1'
    healthcheck:
      test: ["CMD", "mysqladmin" ,"ping", "-h", "localhost"]
      timeout: 20s
      retries: 10
    user: ${UID}:${GID}
    volumes:
      - ./db:/var/lib/mysql
    networks:
      - joomla_network

networks:
  joomla_network:
```

### We'll use a configuration file called `.env`

We're also going to use a configuration file named `.env` (which is never anything more than a silly dictionary of keys - values) to differentiate our projects.

Please create a second file called `.env` with this content:

```env
CONTAINER=joomla
DB_PASSWORD=examplepass
JOOMLA_VERSION=5.1.4-php8.3-apache
MYSQL_PORT=3306
MYSQL_VERSION=8.4.2
PROJECT_NAME=RunningJoomlaInDocker
WEB_PORT=8081
```

### Let's make our lives simpler and lazier; using a `makefile`

Also, a small difference now is that we'll use GNU Make to make our life easier. 

:::note
If you don't know if you already have `make` on your computer, just run `which make` in the console. If you see `make not found` then please run `sudo apt-get update && sudo apt-get install make` to proceed the installation.
:::

So, please create a file called `makefile` in your current directory with this content:

```makefile
-include .env

config:
	@UID=$$(id -u) GID=$$(id -g) docker compose config

down:
	-@UID=$$(id -u) GID=$$(id -g) docker compose down

log:
	-@UID=$$(id -u) GID=$$(id -g) docker compose logs

reset: down
	-@rm -rf db site_joomla

start:
	@printf "\033[1;33m%s\033[0m \n" "To start your site, please jump to http://127.0.0.1:${WEB_PORT}"

up:
	-@mkdir -p db site_joomla
	@UID=$$(id -u) GID=$$(id -g) docker compose up --detach
```

:::caution Indentation should be TAB not space
:::

:::note
If you want to learn more about Make, check my [Linux Makefile - When to use a makefile](/blog/makefile-using-make) article
:::

## Let's start

We're ready. Just before you begin, please check that you have the three files below (please run `ls -alh`):

```txt
Permissions Size User       Group      Date Modified    Name
drwxr-xr-x     - christophe christophe 2024-09-29 16:46 .
drwxrwxrwt     - root       root       2024-09-29 15:51 ..
.rw-r--r--   140 christophe christophe 2024-09-29 16:45 .env
.rw-r--r--   838 christophe christophe 2024-09-29 16:44 compose.yaml
.rw-r--r--   327 christophe christophe 2024-09-29 16:45 makefile
```

### Check our configuration

By running `make config` (`config` is a verb we've defined in `makefile`), we can display the configuration of our project on the screen. We should see a lot of technical information starting with something like:

```yaml
name: runningjoomlaindocker
services:
  joomla:
    container_name: joomla-app
    depends_on:
      joomladb:
        condition: service_healthy
        required: true
    environment:
      JOOMLA_DB_HOST: joomladb
      JOOMLA_DB_PASSWORD: examplepass
    image: joomla:5.1.4-php8.3-apache
    networks:
      default: null
    ports:
      - mode: ingress
        target: 80
        published: "8081"
        protocol: tcp
    restart: always
    user: 1002:1002
[...]
```

:::info
This is a partial content. The objective of `make config` is to make sure that all files are correct (otherwise we'll get error messages) and that variables are well replaced by their values. You can see f.i. that the Joomla version is well the one we've specified in the `.env` file and the user line (the last line here above) is correctly initialized to the *user id:group id* of your current user.
:::

## Let's wake up Joomla...

Here we are at the heart of the subject: we would like to see a beautiful, fresh Joomla site. Is it possible to do this in a single command and even without having to install anything by hand?

The answer is: `make up`.

In your console, just run `make up` and let the magic happen. The very first time, you'll get something like this in your console:

```text
UID=$(id -u) GID=$(id -g) docker compose up --detach
[+] Running 33/12
 ✔ joomla Pulled                                         16.1s
 ✔ joomladb Pulled                                       10.7s

[+] Running 3/3
 ✔ Network runningjoomlaindocker_default  Created         0.0s
 ✔ Container joomla-db                    Healthy        31.7s
 ✔ Container joomla-app                   Started        31.1s
```

What does that means? Docker has retrieved (*pulled*) from the Internet our `joomla` and `joomladb` services (in other terms, has downloaded the Joomla CMS (including PHP and Apache) and MySQL).

By running `docker container list --all --format "table {{.Image}}\t{{.Names}}\t{{.Status}}\t{{.Ports}}"` (or just `docker container list` to get all the columns), you'll get the list of running containers:

```text
IMAGE                        NAMES        STATUS                   PORTS
joomla:5.1.4-php8.3-apache   joomla-app   Up 6 minutes             0.0.0.0:8081->80/tcp
mysql:8.4.2                  joomla-db    Up 7 minutes (healthy)   3306/tcp, 33060/tcp
```

As we can see, yay!, we have our two services (named containers) which are Joomla and MySQL and they are both *Up*. We see that Joomla uses port `8081` and MySQL uses port `3306`. 

:::tip
The port `8081` is the one we've specified in our `.env` (variable `WEB_PORT`) and, the same for MySQL, it uses port `3006` because that's the one we defined (`MYSQL_PORT`). 

Note that `3306` is the standard port for MySQL.
:::

### ... or let's ask him to fall asleep

The opposite command to `make up` is `make down`. Down will remove our Joomla and MySQL containers (read `kill them`) but without removing files (your site and your database) from your hard drive. By running `make up` again, you'll retrieve them.

### ... or let's ask him to suicide

The `make reset` command will stop the containers as here above but, too, will remove files on your disk. 

:::danger
By running `make reset`, you'll the remove both containers and files.
:::

## Getting access to Docker logs

Sometimes, if something goes wrong, it's nice to have access to the Docker logs. Simply run `make log` to achieve this.

## Starting the website

Once `make up` has been fired, our Joomla site is ready. Just run `make start` and read the console's log:

```text
To start your site, please jump to http://127.0.0.1:8081
```

As you can see, the port number is `8081`; the one we've specified in our `.env` file. Simply CTRL-click on the URL if your terminal support this option (otherwise, manually start your preferred web browser and navigate to the specified URL).

![Joomla installer](./images/joomla_installer.png)

**Congratulations, you have successfully installed a fresh Joomla website using Docker!**

## Time for a break

What have we seen so far?

* Without having anything other than Docker you can install Joomla and MySQL from the command line;
* That with an `.env` file we can vary certain values ​​to allow us to have several projects on our hard drive (several Joomla sites);
* That with the `composer.yaml` file we tell Docker what to do to make Joomla and MySQL talk and
* but also that the `composer.yaml` file is valuable since it allows you to define a number of configuration variables.

Let's go a little further.

## Advanced configuration for Joomla

The official Joomla Docker image is maintained by the Joomla community on Docker Hub: [https://hub.docker.com/_/joomla](https://hub.docker.com/_/joomla).

You'll retrieve there a list of *tags* i.e. a list of versions you can installed using Docker but you'll also find a **How to use this image** section and that one is really useful.

Below the list of variables supported by Joomla by the end of September 2024:

| Variable name | Description |
| --- | --- |
| `JOOMLA_DB_HOST` | defaults to the IP and port of the linked mysql container |
| `JOOMLA_DB_USER` | defaults to `root` |
| `JOOMLA_DB_PASSWORD` | defaults to the value of the `MYSQL_ROOT_PASSWORD` environment variable from the linked mysql container |
| `JOOMLA_DB_PASSWORD_FILE` | path to a file containing the database password |
| `JOOMLA_DB_NAME` | defaults to `joomla` |
| `JOOMLA_DB_TYPE` | defaults to `mysqli`; options: `mysqli`, `pgsql` |

The following environment variables are also honored for configuring auto deployment (skip the browser setup) for your Joomla instance:

| Variable name | Description |
| --- | --- |
| `JOOMLA_SITE_NAME` | name of the Joomla site |
| `JOOMLA_ADMIN_USER` | full name of the Joomla administrator |
| `JOOMLA_ADMIN_USERNAME` | username of the Joomla administrator |
| `JOOMLA_ADMIN_PASSWORD` | password of the Joomla administrator |
| `JOOMLA_ADMIN_EMAIL` | email address of the Joomla administrator |
| `JOOMLA_EXTENSIONS_URLS` | semicolon-separated list of URLs to install Joomla extensions from |
| `JOOMLA_EXTENSIONS_PATHS` | semicolon-separated list of file paths to install Joomla extensions from |
| `JOOMLA_SMTP_HOST` | SMTP host for outgoing email |
| `JOOMLA_SMTP_HOST_PORT` | SMTP port for outgoing email |

Pay attention to the last table here above.

We could therefore completely ignore the Joomla configuration screens!!! By specifying certain values, we could therefore install a beautiful, fresh Joomla and already display a functional website.

Let's try.

We'll edit our `compose.yaml` file and add new entries:

```yaml
name: ${PROJECT_NAME:-yourprojectname}

services:
  joomla:
    image: joomla:${JOOMLA_VERSION:-latest}
    container_name: ${CONTAINER:-project}-app
    restart: always
    ports:
      - ${WEB_PORT-:8080}:80
    environment:
      - JOOMLA_DB_HOST=joomladb
      - JOOMLA_DB_PASSWORD=${DB_PASSWORD:-examplepass}
      # highlight-next-line
      - JOOMLA_DB_USER=${DB_USER:-joomla}
      # highlight-next-line
      - JOOMLA_DB_NAME=${DB_NAME:-joomla_db}
      # highlight-next-line
      - JOOMLA_SITE_NAME=${JOOMLA_SITE_NAME:-Joomla}
      # highlight-next-line
      - JOOMLA_ADMIN_USER=${JOOMLA_ADMIN_USER:-Joomla Hero}
      # highlight-next-line
      - JOOMLA_ADMIN_USERNAME=${JOOMLA_ADMIN_USERNAME:-joomla}
      # highlight-next-line
      - JOOMLA_ADMIN_PASSWORD=${JOOMLA_ADMIN_PASSWORD:-joomla@secured}
      # highlight-next-line
      - JOOMLA_ADMIN_EMAIL=${JOOMLA_ADMIN_EMAIL:-joomla@example.com} 
    depends_on:
      joomladb:
        condition: service_healthy
    user: ${UID}:${GID}
    volumes:
      - ./site_joomla:/var/www/html
    networks:
      - joomla_network

  joomladb:
    image: mysql:${MYSQL_VERSION:-latest}
    container_name: ${CONTAINER:-project}-db
    restart: always
    ports:
      - ${MYSQL_PORT-:3306}:3306
    environment:
      # highlight-next-line
      - MYSQL_DATABASE=${DB_NAME:-joomla_db}
      # highlight-next-line
      - MYSQL_USER=${DB_USER:-joomla}
      # highlight-next-line
      - MYSQL_PASSWORD=${DB_PASSWORD:-examplepass}
      - MYSQL_RANDOM_ROOT_PASSWORD='1'
    healthcheck:
      test: ["CMD", "mysqladmin" ,"ping", "-h", "localhost"]
      timeout: 20s
      retries: 10
    user: ${UID}:${GID}
    volumes:
      - ./db:/var/lib/mysql
    networks:
      - joomla_network

networks:
  joomla_network:
```

And we'll also update our `.env` file like this:

```env
CONTAINER=joomla
DB_PASSWORD=example
// highlight-next-line
JOOMLA_ADMIN_EMAIL=joomla@example.com
// highlight-next-line
JOOMLA_ADMIN_PASSWORD=joomla@secured
// highlight-next-line
JOOMLA_ADMIN_USER=Joomla Hero
// highlight-next-line
JOOMLA_ADMIN_USERNAME=joomla
// highlight-next-line
JOOMLA_DB_NAME=joomla_db
// highlight-next-line
JOOMLA_DB_USER=joomla
// highlight-next-line
JOOMLA_SITE_NAME=Joomla
JOOMLA_VERSION=5.1.4-php8.3-apache
// highlight-next-line
MYSQL_PASSWORD=examplepass
MYSQL_PORT=3306
MYSQL_VERSION=8.4.2
PROJECT_NAME=RunningJoomlaInDocker
WEB_PORT=8081
```

As you can see, we've configured some `JOOMLA_ADMIN_xxx` keys and set `JOOMLA_SITE_NAME` to *Joomla*; the name of our website.

Since we've already a running Joomla website, just drop and run a new one. This is simply done using: `make down && make up`. Open the site again (by running `make start`) and see, you don't have the Joomla installation guide again but directly see the frontend.