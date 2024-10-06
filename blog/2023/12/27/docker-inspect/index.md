---
slug: docker-inspect
title: Docker inspect - Retrieve network's information
authors: [christophe]
image: /img/docker_tips_social_media.jpg
tags: [docker, network, tips]
enableComments: true
---
![Docker inspect - Retrieve network's information](/img/docker_tips_banner.jpg)

The `docker inspect` command is used to retrieve detailed information about various Docker objects, including images, containers, volumes, networks, and nodes. It provides a comprehensive overview of the object's configuration, state, and other relevant details.

The returned information is a JSON representation of the object.

One use case is to be able to retrieve the name of the network used by a given container.

<!-- truncate -->

## Some preparation work

:::note Skip this step if you already have a running container
:::

For the illustration, please start a Linux shell and run `mkdir -p /tmp/inspect && cd $_`.

Create a new `index.php` file with this content:

```php
<?php

phpinfo();
```

Then run `docker run --name phpinfo -d -p 8080:80 -u ${UID}:${GID} -v "$PWD":/var/www/html php:8.2-apache` to create a new Docker container (you can surf to `http://localhost:8080` to see it in action).

When running `docker container list` we can retrieve our container named `phpinfo`.

## Run docker inspect on our container

Now by running `docker inspect <container_name>` (in our case, `docker inspect phpinfo`), we'll get a very detailed JSON representation:

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

The name of the used network can be retrieved in the `NetworksSettings.Networks` property.

You can retrieve it more easily using this command:

```bash
docker inspect phpinfo | jq -r '.[0].NetworkSettings.Networks'
```

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

:::tip jq
If you don't have the `jq` binary yet, please read the [The jq utility for Linux](/blog/linux-jq) article. See my article: [The jq utility for Linux](/blog/linux-jq).
:::
