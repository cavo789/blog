---
slug: docker-php-ini
title: Update php.ini when using a Docker image
date: 2023-12-22
description: A step-by-step guide on how to update your php.ini file inside a Docker container using a compose.yaml volume mount. Solve common issues like maximum file upload size.
authors: [christophe]
image: /img/v2/docker_tips.webp
series: Create your joomla website using Docker
mainTag: docker
tags:
  - apache
  - docker
  - joomla
language: en
review_date: 2026-07-30
---
![Update php.ini when using a Docker image](/img/v2/docker_tips.webp)

<TLDR>
This article shows how to override `php.ini` settings (e.g. the max upload file size) in a Dockerized PHP site: create a local `php.ini` file, mount it over the container's config file via a `volumes` entry in `compose.yaml`, then `docker compose down && docker compose up --detach` to apply the change.
</TLDR>

This article aims to answer the following situation: *I'm using a Docker image to run my website and I should modify the php.ini file; how do I do this?*

A real-world example is: you've followed my article <Link to="/blog/docker-joomla">Create your Joomla website using Docker</Link> and everything is working fine. The website is running, and you wish to upload a big file to your site using the Joomla administration web interface. But, then, you get an error *The selected file cannot be transferred because it is larger than the maximum upload size allowed*.

<!-- truncate -->

![Your PHP settings before changes](./images/before.webp)

One of the easiest ways to do is to create a `.ini` file on your disk and <Link to="/blog/docker-volume">share the file with your container</Link>.

Most probably, you'll have a `compose.yaml` file, please edit the file.

For the illustration, below you'll find a copy of the simplest `compose.yaml` file you can retrieve in my <Link to="/blog/docker-joomla">Create your Joomla website using Docker</Link> blog post. *You can have yours of course*. This is just for example.

<Snippet filename="compose.yaml" source="./files/compose.yaml" />

## Step one - Update your yaml file

The solution is to add the `volumes` line if not yet present in your file and, the most important one, the line for *overriding* the `php.ini` file like below:

<Snippet filename="compose.yaml" source="./files/compose.part2.yaml" />

## Step two - Create your own php.ini file

The second thing to do is to create a file called `php.ini` in the same folder as your `compose.yaml` where you'll define your variables; f.i.

<Snippet filename="php.ini" source="./files/php.ini" />

So, now, your folder contains at least two files:

<Terminal typewriter source="./files/terminal-1.txt" />

## Step three - Restart your container

This done, just run `docker compose down ; docker compose up --detach` in your terminal to stop your current container(s) and restart it/them.

Now, when restarting, Docker will take into account your latest changes and update accordingly the `php.ini` file that is present in Docker.

![Your PHP settings after changes](./images/after.webp)
