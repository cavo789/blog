---
slug: docker-git
title: Docker - Install and use Git in a container just like you do on your host
authors: [christophe]
image: /img/git_tips_social_media.jpg
tags: [devcontainer, docker, git, ssh, tips]
enableComments: true
draft: true
---
![Docker - Install and use Git in a container just like you do on your host](/img/git_tips_banner.jpg)

So, no need to tell it anymore, I'm doing everything in Docker containers even coding (since I'm coding using devcontainers) but ... till now, I'm using `git` on my host only.

I mean, I need `git` on my host because I should be able to clone a repository. But the question is: should I use git from my host except for `git clone`?

My current workflow is: from my host, I'm cloning a repo on my disk then I build Docker image(s), run container(s) and jump in it (like starting my devcontainer). I start too a console in my container to start processes, work on files, ...

From time to time, I push my changes to my versioning system (like Gitlab/GitHub) and here is the point: I need to exit my devcontainer, go back to my host and run, from my host, commands like `git add . && git commit -m "feat: The great feature I'm working on it" && git push`.

Let's see how to improve this process and be able to run `git` commands from inside our container.

<!-- truncate -->

## Creating a demo container

Like always, we'll build a fully working example.

Please create a dummy folder and jump in it: `mkdir /tmp/git && cd $_`.

We need a `Dockerfile`, let's create it:

<details>

<summary>Dockerfile</summary>

```dockerfile
# syntax=docker/dockerfile:1

FROM alpine:latest

# Install git and ssh so we can use our SSH credentials
RUN apk update && apk add git openssh-client

WORKDIR /root

RUN set -e -x \
    mkdir -p -m 0700 ~/.ssh

# Keep the container running
ENTRYPOINT ["tail", "-f", "/dev/null"]
```

</details>

We'll also use a `compose.yaml` one, please create this file too:

<details>

<summary>compose.yaml</summary>

```yaml
services:
  docker_git:
    build: .
    tty: true
    volumes:
      # Share our SSH key
      - ${HOME}/.ssh/id_ed25519:/root/.ssh/id_ed25519:ro
      # and share our git configuration file
      - ${HOME}/.gitconfig:/root/.gitconfig
```

</details>

## Running it

We'll create our Docker image and create a container with this single command: `docker compose up --detach --build`.

And, now, we'll jump in the container by running: `docker compose exec docker_git /bin/sh`.

As first check, simply run `git --version` to check if `git` is well installed (which is the case).

## Sharing your configuration

Take a look to the `compose.yaml` file you've created previously.

We've the following line:

```yaml
- ${HOME}/.gitconfig:/root/.gitconfig
```

This tells Docker to share (mount) our local `${HOME}/.gitconfig` file (i.e. our configuration file) with the container. Since, in this example, we're running the container as root, we need to put `/root/.gitconfig` as the target.

:::info
In case, for instance, your container is running as `john_doe`, the line has to be `- ${HOME}/.gitconfig:/home/john_doe/.gitconfig`.
:::

Let's check if it works: still in the console inside the container, please run `git config list`. You'll see the same configuration you've on your host machine. The sharing as worked as expected.

:::note
Depending on the version of git you're using, the command is `git config list` or `git confit --list`.
:::

## Share your credentials

Take a look once more to the `compose.yaml` file.

We've this line:

```yaml
- ${HOME}/.ssh/id_ed25519:/root/.ssh/id_ed25519:ro
```

Think to replace `id_ed25519` by the name of the key you're using like f.i. `id_rsa` if needed.

:::info
Same remark as previously, update the target path to match your user's home directory in the container if needed.
:::

So, since we've already shared both our configuration file and our SSH key, you can, from inside the container, run a git command like `git clone git@your_private_repo` and, as mentioned in the introduction, work on your codebase then run `git add . && git commit -m "feat: The great feature I'm working on it" && git push`.
