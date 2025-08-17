---
slug: docker-run-linux-gui
title: Docker - Run Graphical User Interfaces - Firefox, Chrome & GIMP
authors: [christophe]
image: /img/docker_tips_social_media.jpg
mainTag: docker
tags: [chrome, docker, firefox, gimp, gui, tip]
enableComments: true
---
<!-- cspell:ignore xeyes,xhost,dearmor,dpkg,favourite -->
![Docker - Run Graphical User Interfaces - Firefox, Chrome & GIMP](/img/docker_tips_banner.jpg)

In my [previous post](/blog/docker-gui-in-browser), I've illustrated how to start Firefox or GIMP in a browser. This was the first part of this series about graphical user interfaces because, until very recently, I didn't know it was possible to run GUIs with Docker and that's just amazing.

:::info `GUI` stands for `Graphical User Interface`
:::

So, using Docker, we can start Firefox or GIMP or even ... [Doom 2](https://hub.docker.com/r/classiccontainers/doom2).


In this blog post, we'll create our own xeyes Docker image, then play with Firefox and Gimp.

<!-- truncate -->

## Creating our own xeyes Docker image

Let's start with something really geeky.

Go to a temporary folder (f.i. `mkdir -p /tmp/xeyes && cd $_`) and create a file called `Dockerfile` with this content:

<Snippets filename="Dockerfile">

```Dockerfile
FROM ubuntu:latest

RUN apt-get update && apt-get install -y x11-apps

CMD [ "xeyes" ]
```

</Snippets>

Now, create the image by docker build like this: `docker build --tag cavo789/xeyes .` (replace `cavo789` by anything else like your pseudo).

Make sure you've a variable called `DISPLAY`. You can check this by running `printenv | grep DISPLAY`. If you don't have it, create the variable by running `export DISPLAY=:0` in the console.

Now, run `xhost +local:docker` in your console. That command grants permission to connect to an X server using the Docker socket. This means that applications running within Docker containers can display their graphical user interface (GUI) on the host system. The expected result is this text: `non-network local connections being added to access control list`

Now, simply run a container using and make sure to share the `DISPLAY` variable: `docker run --rm --env DISPLAY=$DISPLAY --volume /tmp/.X11-unix:/tmp/.X11-unix cavo789:xeyes`.

![xeyes under Docker](./images/xeyes_in_docker.png)

Yes, it's true, it's useless, but wow! it's possible to run a GUI from a container and replicate the image in real time on our host machine.

## Creating our own Firefox Docker image

So, once you've understood the very basic example of xeyes, you can think out-of-the-box: which GUI can I install using Docker.

Let's try Firefox... By using my favourite search engine, I've found this post: [Install Official Firefox .deb in Dockerfile](https://jetthoughts.com/blog/install-official-firefox-deb-in-dockerfile-docker-devops/).

In a Dockerfile and with small changes, this give this:

<Snippets filename="Dockerfile">

```Dockerfile
FROM ubuntu:latest

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install --no-install-recommends -y apt-utils ca-certificates curl gpg && \
    rm -rf /var/lib/apt/lists/*

# https://jetthoughts.com/blog/install-official-firefox-deb-in-dockerfile-docker-devops/
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    --mount=type=tmpfs,target=/var/log \
    # Create a directory to store APT repository keys, repository lists, and preferences if they don't exist
    install -d -m 0755 /etc/apt/keyrings /etc/apt/preferences.d /etc/apt/sources.list.d > /dev/null && \
    # Import the Mozilla APT repository signing key
    curl -fsSL https://packages.mozilla.org/apt/repo-signing-key.gpg |  \
    gpg --dearmor --no-tty -o /etc/apt/keyrings/packages.mozilla.org.gpg > /dev/null && \
    # Add the Mozilla APT repository to the APT sources list
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/packages.mozilla.org.gpg] https://packages.mozilla.org/apt mozilla main" |  \
    tee /etc/apt/sources.list.d/packages.mozilla.org.list > /dev/null && \
    # Configure APT to prioritize packages from the Mozilla repository
    echo "Package: *\nPin: origin packages.mozilla.org\nPin-Priority: 1000\n\n" | tee /etc/apt/preferences.d/mozilla > /dev/null && \
    # Update your package list and install the Firefox .deb package
    apt-get update -qq > /dev/null && \
    DEBIAN_FRONTEND=noninteractive apt-get install -qq firefox > /dev/null && \
    rm -rf /var/lib/apt/lists/*

CMD [ "firefox" ]
```

</Snippets>

To build the image, please run the next command (and think to change `cavo789` by your pseudo): `docker build --tag cavo789/firefox .`.

And to start Firefox, just run `docker run --rm -v /tmp/.X11-unix:/tmp/.X11-unix -e DISPLAY=$DISPLAY cavo789/firefox`.

![Running Firefox in a window](./images/firefox.png)

As you know, my OS is Windows 11 and I'm running Linux thanks the amazing WSL2 technology. So, in short, here above, you can see I've started Firefox for Debian as a windowed application in my Windows.

The old MS-DOS developer in me continues to be amazed by this possibility.

## Creation our own Chrome Docker image

We can do the same with Chrome:

<Snippets filename="Dockerfile">

```Dockerfile
FROM ubuntu:latest

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
    && apt-get install -y wget \
    && wget -q https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb \
    && apt-get install -y ./google-chrome-stable_current_amd64.deb \
    && rm -rf /var/lib/apt/lists/*

CMD ["google-chrome", "--disable-dev-shm-usage", "--disable-gpu"]
```

</Snippets>

Build the image using `docker build --tag cavo789/chrome .` then run it using `docker run --rm -v /tmp/.X11-unix:/tmp/.X11-unix -e DISPLAY=$DISPLAY cavo789/chrome`.


![Running Chrome in a window](./images/chrome.png)

## Creating our own GIMP Docker image

Ok, now, I think you've understood how it works. So, very shortly, here is how to run GIMP for Linux in a Docker container:

<Snippets filename="Dockerfile">

```Dockerfile
FROM ubuntu:latest

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install --no-install-recommends -y gimp && rm -rf /var/lib/apt/lists/*

CMD [ "gimp" ]
```

</Snippets>

Create the image by running `docker build --tag cavo789/gimp .`.

And to start GIMP, just run `docker run --rm -v /tmp/.X11-unix:/tmp/.X11-unix -e DISPLAY=$DISPLAY cavo789/gimp`.

![Running GIMP for Linux in a Docker container](./images/gimp.png)
