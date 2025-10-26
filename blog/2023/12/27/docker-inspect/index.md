---
slug: docker-inspect
title: Docker inspect - Retrieve network's information
date: 2023-12-27
description: Use docker inspect to quickly retrieve detailed configuration and network information for your Docker containers in JSON format. Get a power tip with jq.
authors: [christophe]
image: /img/v2/docker_tips.webp
mainTag: docker
tags: [docker, network, tips]
language: en
---
![Docker inspect - Retrieve network's information](/img/v2/docker_tips.webp)

The `docker inspect` command is used to retrieve detailed information about various Docker objects, including images, containers, volumes, networks, and nodes. It provides a comprehensive overview of the object's configuration, state, and other relevant details.

The returned information is a JSON representation of the object.

One use case is to be able to retrieve the name of the network used by a given container.

<!-- truncate -->

## Some preparation work

<AlertBox variant="note" title="Skip this step if you already have a running container" />

For the illustration, please start a Linux shell and run `mkdir -p /tmp/inspect && cd $_`.

Create a new `index.php` file with this content:

<Snippet filename="index.php" source="./files/index.php" />

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

<Terminal>
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

<AlertBox variant="info" title="jq">
If you don't have the `jq` binary yet, please read the <Link to="/blog/linux-jq">The jq utility for Linux</Link> article. See my article: <Link to="/blog/linux-jq">The jq utility for Linux</Link>.

</AlertBox>