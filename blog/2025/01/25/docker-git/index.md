---
date: 2025-01-25
slug: docker-git
title: Docker - Install and use Git in a container just like you do on your host
authors: [christophe]
image: /img/v2/git.webp
mainTag: docker
tags: [devcontainer, docker, git, ssh, tips]
---
![Docker - Install and use Git in a container just like you do on your host](/img/v2/git.webp)

So, no need to tell it anymore, I'm doing everything in Docker containers even coding (since I'm coding using devcontainers) but ... till now, I was using `git` on my host only.

I mean, I need `git` on my host because I should be able to clone a repository. But the question is: should I use git from my host except for `git clone`? Can I work in my container and from there do actions like a `git push`?

My current workflow is: from my host, I'm cloning a repo on my disk then I build Docker image(s), run container(s) and jump in it (like starting my devcontainer). I start too a console in my container to start processes, work on files, ...

From time to time, I push my changes to my versioning system (like Gitlab/GitHub) and here is the point: I need to exit my devcontainer (or use another console), go back to my host and run, from my host, commands like `git add . && git commit -m "feat: The great feature I'm working on it" && git push`.

Let's see how to improve this process and be able to run `git` commands from inside our container.

<!-- truncate -->

## Creating a demo container

Like always, we'll build a fully working example.

Please create a dummy folder and jump in it: `mkdir /tmp/git && cd $_`.

We need a `Dockerfile`, let's create it:

<Snippet filename="Dockerfile">

```docker
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

</Snippet>

We'll also use a `compose.yaml` one, please create this file too:

<Snippet filename="compose.yaml">

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

</Snippet>

:::warning I assume your current ssh key is called id_ed25519
Please run `ls -alh ${HOME}/.ssh/` on your host and check if you've a file `id_ed25519` there. It's your SSH private key. Perhaps you aren't using that file but another one called `id_rsa`. If so, please update the `compose.yaml` file and replace there `id_ed25519` by `id_rsa`.
:::

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
If you don't know yet what is this file, just type `cat ${HOME}/.gitconfig` in the console to see his content; its your git configuration settings.
:::


Let's check if it works still in the console inside the container, please run `git config list` in your container's shell. You'll see the same configuration you've on your host machine. The sharing as worked as expected.

:::warning
In case, for instance, your container is running as `john_doe`, the line has to be `- ${HOME}/.gitconfig:/home/john_doe/.gitconfig` in the yaml file.
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

## Conclusion

From now, you can use any git commands inside your container.

If you've followed the tutorial here above, you can now perfectly do `git clone <<your_private_repo>>` from inside the container and it'll work.

To go further, take a look on the <Link to="/blog/git-precommit">Git - pre-commit hooks</Link> article to learn how to configure your container to run hooks before committing files.
