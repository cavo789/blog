---
slug: docker-joomla
title: Create your own Joomla!® website using Docker
authors: [christophe]
tags: [wsl, docker, joomla, apache, mysql, postgresql]
---
# Create your own Joomla!® website using Docker

In this article, we will learn how to use Docker to install Joomla!® and start a new website.

If you don't have Docker yet, please consult my "[Install Docker and play with PHP](/blog/install-docker)" article.

We'll assume in this article that you've Docker and you're working under Linux or using WSL.

As you know, in order to be able to run a CMS like Joomla!® we need three things:

1. We need a webserver like Apache or nginx,
2. We need a database service like MySQL or PostgreSQL or any other supported databases and
3. We need PHP.

In term of Docker: we need these three services. Because there's a Docker image that takes PHP and Apache at the same time, we could use that one and only need two images. But I prefer to use three, one by service; it makes things clearer and allows one to evolve independently of the other.

So, let's begin.

When you need several services, you need a `docker-compose.yml` file at the root of the project. This defines the list of services required.

You'll find an example of the `docker-compose.yml` file on the Joomla image description page: [https://hub.docker.com/_/joomla](https://hub.docker.com/_/joomla) *search for `docker-compose` on this page.*

## Everything in memory; nothing on disk

Please create on your disk, let's say in the `/tmp/joomla` folder a file called `docker-compose.yml` with this content:

```yaml
version: '3.1'

services:
  joomla:
    image: joomla
    restart: always
    links:
      - joomladb:mysql
    ports:
      - 8080:80
    environment:
      JOOMLA_DB_HOST: joomladb
      JOOMLA_DB_PASSWORD: example

  joomladb:
    image: mysql:8.0.13
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: example
```

To make things as clear as possible, here is my temporary folder content:

```bash
❯ pwd
/tmp/joomla

❯ ls -alh
Permissions Size User       Group      Date Modified    Name
drwxr-xr-x     - christophe christophe 2023-11-04 09:32  .
drwxrwxrwt     - root       root       2023-11-04 09:32 ..
.rw-r--r--   325 christophe christophe 2023-11-04 09:32 docker-compose.yml
```

So I just have one file and this is our newly, created, `docker-compose.yml` file.

Now, if needed, please start a Linux console and go to your joomla folder (i.e; `cd /tmp/joomla`). From there, run the command below:

```bash
docker compose up --detach
```

Docker will start downloading `joomla` and `joomladb`, the two services mentioned in the `docker-compose.yml` file. You'll obtain something like this, please wait until everything is downloaded.

```bash
❯ docker compose up --detach
[+] Running 16/35
 ⠹ joomladb 12 layers [⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀]    0B/0B  Pulling  19.3s
   ⠧ 177e7ef0df69 Waiting   15.8s
   ⠧ cac25352c4c8 Waiting   15.8s
   ⠧ 8585afabb40a Waiting   15.8s
   [...]
 ⠹ joomla 21 layers [⣿⣿⣦⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣦⣿⣿⣿⣿⣀⠀⠀] 94.59MB/155.9MB Pulling  19.3s
   ✔ 578acb154839 Pull complete  11.3s
   ✔ c053f6f43c12 Pull complete  11.9s
   ⠋ 65cebbf4d847 Downloading [==============>         ]  68.41MB/104.4MB  16.1s
   ✔ 34045bc93960 Download complete  1.0s
   [...]
```

You can notice that Docker is downloading two images, one for `joomladb` and one for `joomla`.

At the end, once downloaded, you'll get an output like this:

```bash
❯ docker compose up --detach
[+] Running 35/35
 ✔ joomladb 12 layers [⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿]  0B/0B   Pulled  84.9s
   ✔ 177e7ef0df69 Pull complete  26.9s
   ✔ cac25352c4c8 Pull complete  27.5s
   ✔ 8585afabb40a Pull complete  28.2s
   [...]
 ✔ joomla 21 layers [⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿] 0B/0B  Pulled  146.4s
   ✔ 578acb154839 Pull complete   11.3s
   ✔ c053f6f43c12 Pull complete   11.9s
   ✔ 65cebbf4d847 Pull complete   31.2s
   [...]
[+] Running 3/3
 ✔ Network joomla_default       Created  0.3s
 ✔ Container joomla-joomladb-1  Started  52.9s
 ✔ Container joomla-joomla-1    Started  38.8s
```

So the two images have been donwloaded and, then,

1. a `joomla_default` network has been created,
2. the `joomla-joomladb-1` container has been created (this is our database server) and
3. the `joomla-joomla-1` container has been created too (this is our Joomla service).

:::note Why joomla-joomlaxxx name?
We didn't give our project a name, we just created a `docker-compose.yml` file in the `joomla` folder. So, Docker has nammed our project using the folder name (`joomla`) concatenated to service name (refers to the `docker-compose.yml` file, we've two services, one called `joomladb` and one called `joomla` That's why...
:::

If you are curious, you can run the `docker image list` command to get the list of Docker images already downloaded on your machine.

```bash
❯ docker image list
REPOSITORY   TAG       IMAGE ID       CREATED       SIZE
joomla       latest    882b2151d890   2 days ago    663MB
mysql        8.0.13    102816b1ee7d   4 years ago   486MB
```

Ok, so, Docker has downloaded Joomla (in its *latest* version) and MySQL (version 8.0.13).

We're almost done.

For the curiosity, run `docker container list`:

```bash
❯ docker container list
CONTAINER ID   IMAGE          COMMAND                  CREATED          STATUS          PORTS                    NAMES
0798f8f25d2b   joomla         "/entrypoint.sh apac…"   8 minutes ago    Up 5 minutes    0.0.0.0:8080->80/tcp     joomla-joomla-1
7b7fcd3809b0   mysql:8.0.13   "docker-entrypoint.s…"   8 minutes ago    Up 7 minutes    3306/tcp, 33060/tcp      joomla-joomladb-1
```

We've two running containers. Pay attention to the `PORTS` column: our `joomla` container is listening on the port `8080` and our `mysql` container is listening on port `3306`.

Hey, port `8080`, does that mean anything to you? That's a port for a web page, isn't it? 

Let's try: start your favorite browser and navigate to `http://localhost:8080`...

![Joomla installer](./images/joomla_installation_screen.png)

:::info Just incredible; no?
Wow, doesn't that sound crazy? With a single command (`docker compose up --detach`), you've downloaded everything you need to get Joomla running on your machine.
:::

Let's rewind for a few seconds: in order to run Joomla, we knew we needed three things + 1; a webserver, a database server, PHP and, of course, we need Joomla. **And here, just by running one command, hop, all the magic happens.**

Let's go back to our Linux console and check what's been downloaded.

```bash
❯ pwd
/tmp/joomla

❯ ls -alh
Permissions Size User       Group      Date Modified    Name
drwxr-xr-x     - christophe christophe 2023-11-04 09:32  .
drwxrwxrwt     - root       root       2023-11-04 09:32 ..
.rw-r--r--   325 christophe christophe 2023-11-04 09:32 docker-compose.yml
```

Wow... nothing... Nothing has been download in my folder. I don't have Joomla in my folder.

We'll discuss this later on but yes, by default with Docker, everything happens in memory, nothing on disk. If you can't wait, please read my "[Share data between your running Docker container and your computer](/blog/docker-volume)" article.