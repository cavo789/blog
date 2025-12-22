---
slug: github-networking-troubleshooting
title: Troubleshooting for Docker containers - Accessing the other one
date: 2025-12-22
description: Troubleshoot Docker container networking - test ports, DNS, and fix proxy issues so one container can reliably call another API on the same network.
authors: [christophe]
image: /img/v2/autopsy_binary_crime.webp
mainTag: Docker
tags: [docker, network]
language: en
blueskyRecordKey:
---
![Troubleshooting for Docker containers - Accessing the other one](/img/v2/autopsy_binary_crime.webp)

The situation: I've two containers; one called `provider` and the other one called `consumer`. The `consumer` should be able to run an API on the `provider`.

And ... it didn't work: something in my configuration is not correct because I get connection errors when trying to call the `provider`, let's start the investigation and understand the solution.

In the rest of this article, let's call them like that: `provider` for the first container and `consumer` for the second one.

## First, they should be on the same network

First, the should be on the same Docker network otherwise, no chance to make it working.

By running `docker ps` you'll get the `container_id` and the `name` of your two containers.

The command to retrieve the name of the Docker network is `docker inspect --format '{{json .NetworkSettings.Networks}}' CONTAINER_NAME | jq` so, for the first container, please run `docker inspect --format '{{json .NetworkSettings.Networks}}' provider | jq` and `docker inspect --format '{{json .NetworkSettings.Networks}}' consumer | jq` for the second.

You'll get something like that:

<Snippet source="./files/network.json" />

In this example, the network is called `your_network`. Just make sure you've the same for both containers. Also, make sure you've the same `Gateway` too (`192.168.0.1` in this example).

<AlertBox variant="tip" title="Ok, they're running on the same network." />

## Then, testing the internal port for both containers

Please run `docker ps --format "table {{.ID}}\t{{.Names}}\t{{.Ports}}"` to get the list of running containers and their ports (extern/intern).

You'll get something like this:

```bash
CONTAINER ID   NAMES    PORTS
5abd45eecfa3   consumer   0.0.0.0:8001->8000/tcp, [::]:8001->8000/tcp
a95b6174beb9   provider     0.0.0.0:8888->8000/tcp, [::]:8888->8000/tcp
```

So they both are running port `8000` internally but the `consumer` is exposed on the host using port `8001` and `provider` on port `8888`.

In the previous chapter, we just have seen the network is called `your_network`.

We can ensure the processus running on port `8000` in both containers is running by executing `docker inspect -f '{{.NetworkSettings.Networks.your_network.IPAddress}}' consumer` in the console to get the IP of that container. In my case, I get `192.168.0.4` as response.

Now that we've it, we can test the internal port:

<Terminal wrap={true}>
$ telnet 192.168.0.4 8000

Trying 192.168.0.4...
Connected to 192.168.0.4.
Escape character is '^]'.
</Terminal>

Press <kbd>CTRL</kbd>+<kbd>C</kbd> to quit.

<AlertBox variant="tip" title="Ok, both containers have a service running on their internal port." />

## Third, testing the external port for both containers

We've seen containers are running on port `8000` internally but one is mapping the port `8001` on the host and `8888` for the second one.

We can run `telnet 127.0.0.1 8001` and `telnet 127.0.0.1 8888` to test that port. **See, here, since we're accessing exposed ports, we're using our local host IP address.**

If you know that the service is a web service, you can run `curl -vvv 127.0.0.1:8001` to make sure the service is working fine and the delivered answer meet your expectations:

<Snippet source="./files/curl.txt" />

<AlertBox variant="tip" title="Ok, both containers are correctly exposed on their external port." />

## Fourthly, testing connectivity between the two containers

Run `docker ps --format "table {{.ID}}\t{{.Names}}\t{{.Ports}}"` again the get the container name and his associated container ID back.

In our preambule, we've said: the `consumer` should be able to run an API from the `provider` so let's jump in the `consumer` by creating a console. We'll using the CONTAINER_ID of the consumer and we'll connect as `root`:

<Terminal wrap={true}>
$ docker exec --user root -it 5abd45eecfa3 sh
</Terminal>

We'll first try `ping` to see if we can connect to the `provider` container:

<Terminal wrap={true}>
$ apt-get update

$ apt-get install -y iputils-ping
</Terminal>

Once done, try `ping` followed by the container name (we've already identify `provider` and `consumer` being our containers name thanks our `docker ps` command).

<Terminal wrap={true}>
$ ping provider

PING provider (192.168.0.3) 56(84) bytes of data.
64 bytes from provider (192.168.0.3): icmp_seq=1 ttl=64 time=0.176 ms
64 bytes from provider (192.168.0.3): icmp_seq=2 ttl=64 time=0.064 ms
64 bytes from provider (192.168.0.3): icmp_seq=3 ttl=64 time=0.064 ms
64 bytes from provider (192.168.0.3): icmp_seq=4 ttl=64 time=0.068 ms
</Terminal>

Press <kbd>CTRL</kbd>+<kbd>C</kbd> to stop.

<AlertBox variant="tip" title="Ok, our consumer can reach the provider both containers are correctly exposed on their external port.">

This means that the DNS resolution is working fine.
</AlertBox>

### Testing the port

Still in the `consumer` container, install `telnet` if needed

<Terminal wrap={true}>
$ apt-get update

$ apt-get install -y telnet
</Terminal>

Then run `telnet provider 8000` i.e. the name of the container and his internal port (not the exposed one)

<Terminal wrap={true}>
$ telnet provider 8000

Trying 192.168.0.3...
Connected to bim_provider_api.
Escape character is '^]'.
</Terminal>

<AlertBox variant="tip" title="Trying the exposed port">
Just rerun the last `telnet` command but using port `8888` this time: it'll not work.

By using the container name with telnet, we should use the internal port; not the exposed one.
</AlertBox>

<AlertBox variant="tip" title="Ok, our consumer can reach the provider both containers are correctly exposed on their external port.">

`telnet` is used to test the **transport layer** (layer #4 in the [OSI model](https://en.wikipedia.org/wiki/OSI_model)) and our test here is showing it's work.
</AlertBox>

### Testing the application

Now that we know containers can communicate, let's try the **application layer** (layer #7 in the [OSI model](https://en.wikipedia.org/wiki/OSI_model)).

In my use case, the `provider` container is offering an API so I should be able to reach it using `curl`.

<Terminal wrap={true}>
$ curl -v http://provider:8000
</Terminal>

In my situation, this is where I got an error and the dump is showing something like this:

```text
<body><div class="message-container">
<div class="logo"></div>
<h1>504 DNS look up failed</h1>
<p>The webserver reported that an error occurred while trying to access the website. Please return to the previous page.</p>
<table><tbody>
<tr>
<td>URL</td>
<td>http://provider:8000/</td>
</tr>
</tbody></table>
</div></body>
```

**Bingo! The problem is ... a proxy.**

The request was intercepted by a proxy and that one is denying the request.

We should tell him to ignore request made to our container.

```bash
export no_proxy="provider,192.168.0.0/24,127.0.0.1,localhost"
export NO_PROXY="provider,192.168.0.0/24,127.0.0.1,localhost"
```

* `provider` is the name of our container,
* `192.168.0.0/24` is the IP range for the Docker subnet (you can retrieve it by running `docker network inspect your_network | jq -r '.[].IPAM.Config[0].Subnet'`)
* the well-known `127.0.0.1,localhost` is our localhost

<AlertBox variant="tip" title="The no_proxy variable">
To make sure all tools (`curl`, `wget`, `apt-get`, ...) are well using the `no_proxy` variable, it's recommanded to use both notation: lower and upper case.
</AlertBox>

Now, finally, the command I get consume my API using a command like `curl -X POST -H 'Content-Type: application/json' -H 'Accept: application/json' http://provider:8000/api/v1/fetch`.

## Fifthly and finding the solution

If you came across this article because you had the same problem as me, the solution is now simple: make sure your Docker image is configured to have a `no_proxy` variable with the correct values.

This can be done using a `no_proxy` variable in your `compose.yaml` file, here, just for the illustration, a sample way to do this:

```yaml
services:
  consumer:
    image: your_image
    build:
      context: .
      dockerfile: Dockerfile
      args:
        - HTTP_NO_PROXY=${HTTP_NO_PROXY:-provider,localhost,.local,127.0.0.1,192.168.0.0/24}
```

Now, in your `Dockerfile` just do something like:

```Dockerfile
# syntax=docker/dockerfile:1
ARG HTTP_NO_PROXY="localhost,.local,127.0.0.1,192.168.0.0/24"

FROM python:3.14-slim AS production

ARG HTTP_NO_PROXY

ENV no_proxy="${HTTP_NO_PROXY}" \
    NO_PROXY="${HTTP_NO_PROXY}"
```

Create your containers again and tadaaaa! it'll work.

In our example here, we finally determined that it was not the network layer that was at fault, but rather the layer where the proxy took control: the application layer.
