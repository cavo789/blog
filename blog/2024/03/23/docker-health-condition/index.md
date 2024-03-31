---
slug: docker-health-condition
title: Understanding the depends_on condition in Docker compose files
authors: [christophe]
image: /img/docker_tips_social_media.jpg
tags: [docker, tips]
enableComments: true
---
![Understanding the depends_on condition in Docker compose files](/img/docker_tips_header.jpg)

It's only been ten days or so since I learned the trick, even though it was well documented: managing service startups and, above all, blocking one if the other isn't ready ([official documentation](https://docs.docker.com/compose/startup-order/#control-startup)).

Imagine a two services applications like Joomla (see my [Create your Joomla website using Docker](/blog/docker-joomla/)), WordPress, LimeSurvey, Laravel and many, many more use cases: you've an application and that application requires a database.

<!-- truncate -->
You've, roughly speaking, a `docker-compose.yml` file like this:

```yaml
services:
  joomla:
    image: joomla
    [...]

  joomladb:
    image: mysql:8.0.13
    [...]
```

And, yeah, it works. You can execute `docker compose up --detach` and wait until the two services are up and soon or later, you'll got your application ready.

But you have the intuition that something isn't quite right here... What happens if the database service is slow to load? You'd have the application (Joomla here, but it doesn't really matter) which, in its initialization process, is going to want to connect to the database, and wham! This will not work and you will receive *Error when connecting to the database* errors. With a bit of luck, the application will try several times before stopping in error. Without chance, the application will just crash.

How to solve this? The answer is in two parts.

1. You need to instruct Docker how he can know that the service is ready,
2. You need to pause the application service until the database is ready.

## The healthcheck property

The idea is to ask Docker to run a given command each xxx seconds until he got a `Success` status (in term of Linux, it's a command that return an exitcode equal to `0`).

By searching on the Internet using `docker healthcheck` followed by the name of a service (MySQL, PostgreSQL, Apache, Redis, ...), you'll find a lot of possibilities.

For MySQL, we'll use the next one:

```yml
services:
  joomla:
    image: joomla
    [...]

  joomladb:
    image: mysql:8.0.13
    [...]
    // highlight-next-line
    healthcheck:    
      // highlight-next-line
      test: ["CMD", "mysqladmin" ,"ping", "-h", "localhost"]
      // highlight-next-line
      timeout: 20s
      // highlight-next-line
      retries: 10
```

The four lines here above informs Docker to check each 20 seconds and max 10 times the command defined by the `test` property. While that command didn't return `0`, the container will be considered as `unhealthy`. Then, hopefully, the command will return `0` and Docker will consider the service as `healthy`.

## The depends_on property

Now, the second part is to create a dependency in our application. Back to the Joomla service (in our example), we'll add a `depends_on` property like below.

```yml
services:
  joomla:
    image: joomla
    [...]
    // highlight-next-line
    depends_on:
      // highlight-next-line
      joomladb:
        // highlight-next-line
        condition: service_healthy

  joomladb:
    image: mysql:8.0.13
    [...]
    healthcheck:    
      test: ["CMD", "mysqladmin" ,"ping", "-h", "localhost"]
      timeout: 20s
      retries: 10
```

It's pretty self-explanatory, I think. Docker will pause the creation of the Joomla container (just the creation, not downloading the image or any previous step) while the `depends_on` service isn't healthy.

And do you know what? I'm mad I didn't know about this sooner, because I've already set up a script like the one below in my applications:

:::note Very simplified script

```bash
while [[ ! "$exitCode"  = "0" ]]; do
  echo "Waiting MySQL to launch on 3306..."
  exitCode="$(nc joomladb 3306)"
done
```

:::
