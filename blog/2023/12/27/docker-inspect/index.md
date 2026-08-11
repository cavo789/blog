---
slug: docker-inspect
title: Docker inspect - Retrieve network's information
date: 2023-12-27
description: Use docker inspect to quickly retrieve detailed configuration and network information for your Docker containers in JSON format. Get a power tip with jq.
authors: [christophe]
image: /img/v2/docker_tips.webp
mainTag: docker
tags:
  - docker
  - linux
language: en
review_date: 2026-07-30
---
![Docker inspect - Retrieve network's information](/img/v2/docker_tips.webp)

<TLDR>
This article shows how to use `docker inspect <container>` to get a container's full JSON configuration, and how to pull out just the network name/IP from the `NetworkSettings.Networks` property using `docker inspect <container> | jq -r '.[0].NetworkSettings.Networks'`.
</TLDR>

The `docker inspect` command is used to retrieve detailed information about various Docker objects, including images, containers, volumes, networks, and nodes. It provides a comprehensive overview of the object's configuration, state, and other relevant details.

The returned information is a JSON representation of the object.

One use case is to be able to retrieve the name of the network used by a given container.

<!-- truncate -->

## Get the network name in one line

You have a container running and you want to know which network it is attached to. One command:

<Terminal typewriter>
$ docker inspect phpinfo | jq -r '.[0].NetworkSettings.Networks'
</Terminal>

You'll get something like this:

```json
{
  "bridge": {
    "IPAMConfig": null,
    "Links": null,
    "Aliases": null,
    "NetworkID": "efd8b4ee99a7d4283cdfecd122a9357ea8415d3f7cb60b53bda36f1f08d76847",
    "EndpointID": "58ff9063ffdb295ed5b9935a036c2f32225312a3290fdcd90eda96e5f5b6c12b",
    "Gateway": "172.17.0.1",
    "IPAddress": "172.17.0.3",
    "IPPrefixLen": 16,
    "IPv6Gateway": "",
    "GlobalIPv6Address": "",
    "GlobalIPv6PrefixLen": 0,
    "MacAddress": "02:42:ac:11:00:03",
    "DriverOpts": null
  }
}
```

There it is: the network name is the key (`bridge` here), and right below it the `Gateway` and `IPAddress` you usually need in the same breath. Replace `phpinfo` with your own container name and you're done.

<AlertBox variant="info" title="jq">
If you don't have the `jq` binary yet, please read the <Link to="/blog/linux-jq">The jq utility for Linux</Link> article.

</AlertBox>

## The full inspect output

That one-liner is just a filter on a much bigger answer. Running `docker inspect <container_name>` (in our case, `docker inspect phpinfo`) without `jq` gives a very detailed JSON representation:

```json
[
    {
        "Id": "1243e5a1d063920759525befa6e374fe2a9bc7ae032559877522e59d7afdc6e8",
        "Created": "2023-12-12T07:52:38.480516578Z",
        "Path": "docker-php-entrypoint",
        "Args": [
            "apache2-foreground"
        ],
        [...]
        //highlight-next-line
        "NetworkSettings": {
            //highlight-next-line
            [...]
            //highlight-next-line
            "Networks": {
                //highlight-next-line
                "bridge": {
                    //highlight-next-line
                    "IPAMConfig": null,
                    //highlight-next-line
                    "Links": null,
                    //highlight-next-line
                    [...]
                //highlight-next-line
                }
            //highlight-next-line
            }
            [...]
        }
        [...]
    }
]
```

The highlighted lines are the ones the `jq` filter above walks through: `NetworkSettings`, then `Networks`. Everything else in that dump — mounts, environment, entrypoint, state, health — is available the same way, by pointing `jq` at another property.

<Details label="No container running? Create one to play with.">

For the illustration, please start a Linux shell and run `mkdir -p /tmp/inspect && cd $_`.

Create a new `index.php` file with this content:

<Snippet filename="index.php" source="./files/index.php" />

Then run `docker run --name phpinfo -d -p 8080:80 -u ${UID}:${GID} -v "$PWD":/var/www/html php:8.2-apache` to create a new Docker container (you can surf to `http://localhost:8080` to see it in action).

When running `docker container list` we can retrieve our container named `phpinfo`.

</Details>

## Conclusion

`docker inspect` answers with everything, which is exactly why it feels useless the first time you run it. Paired with `jq` and a property path, it becomes the fastest way to get one precise fact about a running container — and the network name is the one you'll need most often.

Two concrete applications of exactly that: attaching a database UI to an existing container in <Link to="/blog/docker-adminer-pgadmin-phpmyadmin">Using Adminer, pgadmin or phpmyadmin</Link>, and diagnosing why two containers can't talk to each other in <Link to="/blog/docker-networking-troubleshooting">Troubleshooting for Docker containers</Link>.
