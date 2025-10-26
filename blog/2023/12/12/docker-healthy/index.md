---
slug: docker-healthy
title: Get health information from your running containers
date: 2023-12-12
description: Learn how to quickly retrieve the health information of your running Docker containers using the docker ps command and the State.Health response. Keep your containers healthy!
authors: [christophe]
image: /img/v2/docker_tips.webp
mainTag: bash
tags: [bash, docker, tips]
language: en
---
![Get health information from your running containers](/img/v2/docker_tips.webp)

When you've a few runnings containers on your machine, you can quickly retrieve the health information using `docker ps` and his `State.Health` response.

In this article, we'll look at how to create a bash script that can be used as a basis for other needs.

<!-- truncate -->

Please create somewhere on your disk, in a Linux console, a script f.i. called `health.sh` with this content:

<Snippet filename="health.sh" source="./files/health.sh" />

<AlertBox variant="info" title="Get the list of all containers">
`docker container list --all --format "{{.Names}}"` return the list of all containers and only echo the column `Name` on the console.

</AlertBox>

Make sure to make the script executable: `chown +x health.sh`.

Here is the output of the script when launched:

![Docker health checks](./images/healthy.png)

I've a few containers running on my machine, a lot are `healthy` meaning that they're running and without any issue, I've two containers in a `null` state i.e. they are sleeping and none are stopped due to an error.

Don't hesitate to fine-tune the script to fit your needs.