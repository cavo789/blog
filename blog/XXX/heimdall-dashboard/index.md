---
slug: heimdall-dashboard
title: Heimdall - Web dashboard
authors: [christophe]
image: /img/docker_tips_social_media.jpg
tags: [docker]
enableComments: true
draft: true
---
![Heimdall - Web dashboard](/img/docker_tips_banner.jpg)

> [https://github.com/linuxserver/Heimdall](https://github.com/linuxserver/Heimdall)


![Heimdall - Web dashboard](./images/heimdall.gif)

As decribed on the [official Docker Hub page](https://hub.docker.com/r/linuxserver/heimdall/), we just need to create a `compose.yaml` file with this content:

<details>
<summary>compose.yaml</summary>


```yaml
services:
  heimdall:
    image: lscr.io/linuxserver/heimdall:latest
    container_name: heimdall
    environment:
      - PUID=1002
      - PGID=1002
      - TZ=Europe/Brussels
    volumes:
      - ./config:/config
    ports:
      - 80:80
      - 443:443
    restart: unless-stopped

```
</details>

`docker compose up --build --detach`

Make sure the config folder is owned by you: run `ls -alh` to check this. If it's not owned by you, you'll have to adjust `PUID` and `PGID` values.

:::note
`PUID` is your host user id. You can get it by running `id -u` in your console. `PGID` is your host group id and here, the command to use is `id -g`. Think to check yours (for me it's `1002` for both so I need to replace `1000` by `1002`).
:::
