---
slug: docker-cheatsheet
title: Docker cheat sheet
authors: [christophe]
image: /img/docker_tips_social_media.jpg
tags: [docker, tip]
enableComments: true
draft: true
---
![Docker cheat sheet](/img/docker_tips_banner.jpg)

<!-- truncate -->

## Images

### Build an image

As soon as you've a file called `Dockerfile` you can create a Docker image (regardless the presence of a `docker-compose.yml` file). And, sometimes it's handy to create the image just to check that it works as expected.

By running `docker build .`, you will create the image. 

* You can add the `--no-cache` flag to make sure to bypass the cache f.i. `docker build --no-cache .`.
* Use the `--tag` flag to name your image like f.i. `docker build --tag cavo789/blog .`.

Once created, simply run `docker image list` to get the list of images present on your machine. You should retrieve yours.

### Start an interactive shell session

`docker run -it <image_name> /bin/sh`

### Kill any images based on a prefix 

Same as for containers, if your images have a prefix, you can drop all images using `docker rmi $(docker images | grep <prefix> | tr -s ' ' | cut -d ' ' -f 3)`.

If you want to check once the command here been fired, just run `docker images --format "{{.Repository}}" | grep <prefix>`. The returned list should be empty.

## Containers

### Remove all containers (even if stopped) based on a prefix

When working on a project with multiple containers, you'll probably use a prefix when naming your containers.

If you want to kill all containers in one command: `docker container rm --force $(docker ps -a -q --filter name=<prefix>)` will make the job.

Think to add `--volumes` like in `docker container rm --volumes --force $(docker ps -a -q --filter name=<prefix>)` to also kill associated volumes.

If you want to check then if your containers are well removed, just run `docker container list | grep <prefix>`. The returned list should be empty.

## Volumes

### Kill any volumes based on a prefix

And to remove all volumes based on a prefix, just run `docker volume rm $(docker volume list -q | grep <prefix>)`.

To check if it was successful, run `docker volume list | grep <prefix>`. The returned list should be empty.
