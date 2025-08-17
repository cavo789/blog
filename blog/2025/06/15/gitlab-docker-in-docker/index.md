---
slug: gitlab-docker-out-of-docker
title: GitLab - Running Docker-out-of-Docker in your CI
authors: [christophe]
image: /img/git_tips_social_media.jpg
mainTag: gitlab
tags: [CI, dagger, dood, docker, gitlab, quarto]
blueSkyRecordKey: 3lun2kg2vmk2r
enableComments: true
---
![GitLab - Running Docker-out-of-Docker in your CI](/img/git_tips_banner.jpg)

<!-- cspell:ignore dood,phplint,certdir -->

At work, I'm running my CI using Docker. Each time I push changes to GitLab, a CI is running: a Docker container is started by GitLab, pulling my code and running a set of tools.

The container started by GitLab can be based on a PHP, Python and just Alpine Docker image. GitLab is then pulling my code inside the container and f.i. run a tool like `phplint` and it's all good.

For a few months now, I've been creating a Docker image to run [Dagger](https://dagger.io). So, here, I come in trouble: my GitLab CI Docker container should be able to run `docker run ... my_dagger_image` and by, default, it's not possible.

But I'm in even more trouble when, in my Dagger container, I have to launch another container (one by tools).

Yes, you've guessed it: I'm faced with a situation of running Docker from inside a Docker container already running by another container.

Let's see how to solve this problem.

<!-- truncate -->

As prerequisites, you should have access to the server where your GitLab instance is running (aka the *GitLab Runner*) since you'll need to make changes to the configuration of the runner.

## The runner configuration file

On my GitLab runner server, my current `/etc/gitlab-runner/config.toml` configuration defines Docker as the executor because I've this entry:

<Snippets filename="/etc/gitlab-runner/config.toml">

```toml
[[runners]]
  executor = "docker"
```

</Snippets>

So, when running my CI, first GitLab will create a Docker container. The default base image can be forced in `/etc/gitlab-runner/config.toml` like below or you just have to specify the base image in your project's `.gitlab-ci.yml` using the `image` tag ([doc](https://docs.gitlab.com/ci/docker/using_docker_images/#define-image-in-the-gitlab-ciyml-file)).

<Snippets filename="/etc/gitlab-runner/config.toml">

```toml
[[runners]]
  executor = "docker"

  // highlight-next-line
  [[runners.docker]]
    // highlight-next-line
    image = "php8.4"
```

</Snippets>

## Understanding the process

For this part, I'll take a very basic example. For sure, it's not needed to run Docker-in-Docker for a simple "php lint" action. I'll just use that scenario to not over-complicate things.

So, based on the `config.toml` file here above, I can have a `.gitlab-ci.yml` file like the one below:

<Snippets filename=".gitlab-ci.yml">

```yaml
phplint:
  script:
    - find . -name "*.php" -print0 | xargs -0 -n1 php -l
```

</Snippets>

It'll retrieve all `.php` file and run `php -l <filename.php>` for each inside a Docker container based on PHP 8.4.

Easy and straight-forward.

## Running Docker-out-of-Docker

Based on the same example, we can also use an existing Docker image; like [phpqa/jakzal](https://github.com/jakzal/phpqa):

<Snippets filename=".gitlab-ci.yml">

```
phplint:
  image: docker:28.1.1
  variables:
    DOCKER_HOST: unix:///var/run/docker.sock
    DOCKER_TLS_CERTDIR: ""
  script:
    - docker run --rm --volume "$CI_PROJECT_DIR:/app" --workdir /app jakzal/phpqa phplint .
```

</Snippets>

Now, to allow this, we'll need to update our GitLab Runner server configuration file:

<Snippets filename="/etc/gitlab-runner/config.toml">

```toml
[[runners]]
  executor = "docker"

  [[runners.docker]]
    image = "php8.4"

    // highlight-next-line
    volumes = [ ..., "/var/run/docker.sock:/var/run/docker.sock","/builds:/builds"]
```

</Snippets>

:::caution
The syntax `volumes = [ ..., "/var/run/docker.sock:/var/run/docker.sock","/builds:/builds"]` used above is to inform you to append the two values to the list you already have. So, if, right now, you've `volumes = ["/cache", "/certs/client"]` then append values to get `volumes = ["/cache", "/certs/client", "/var/run/docker.sock:/var/run/docker.sock","/builds:/builds"]`
:::

We need to allow the **Docker daemon** which is running on the GitLab runner server to share its daemon (the file `/var/run/docker.sock`) so, the GitLab CI Docker container can run `docker run` statements like f.i. `docker run --rm --volume "$CI_PROJECT_DIR:/app" --workdir /app jakzal/phpqa phplint .`

As you can see, there is also a flag `--volume "$CI_PROJECT_DIR:/app"`. This will share the folder referenced by the variable `$CI_PROJECT_DIR` with the container but here, be careful.

Let's say `$CI_PROJECT_DIR` is initialized to `/builds/your-group/your-project`. The `/builds/your-group/your-project` is the one from your Gitlab runner server (so `/builds/your-group/your-project` is a folder on the server). In your GitLab CI Docker container, the `/builds/your-group/your-project` also exists but when you run `docker run --rm --volume "$CI_PROJECT_DIR:/app" --workdir /app jakzal/phpqa phplint .`, you're thus trying to share the host directory with your new container and it'll not work **unless** you've allowed it.

Refers to the update we've already made in the `config.toml` file here above. We've shared `"/var/run/docker.sock:/var/run/docker.sock"` to allow to share the Docker socket but, too, we've shared `"/builds:/builds"` and here, it's to share the `builds` folder.

:::info
This technique is called **Docker Socket Passthrough**.
:::

Now, it'll work: we we'll share our Docker daemon and, too, we'll share the folder on the server where our codebase was pulled before running the CI.

From now, we can not only run `docker run [...]` statements but, too, share our folder with the newly created container.

Why do I need this? Let's take just one example: documentation generation. I'm pushing my documentation as a set of `.md` files (in a folder called `documentation`) then, during my CI, I'm running [Quarto](https://quarto.org/) to process these Markdown files and based on my configuration (the `_quarto.yml` file), I can generate offline files (like `.docx`, `.pdf`, ...) but, too, a static HTML site.  In this last situation, I'll export the static site somewhere (`./public/documentation`) then publish it using GitLab pages.
