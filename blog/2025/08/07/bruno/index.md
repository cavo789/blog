---
slug: bruno
title: Bruno - A postman-like tool - GUI and CLI
date: 2025-08-07
description: Explore Bruno, a powerful Postman-like API testing tool with both GUI and CLI support.
authors: [christophe]
image: /img/v2/api.webp
series: Building and testing REST APIs
mainTag: api
tags:
  - api
  - docker
  - tests
language: en
updates:
  - date: 2026-07-30
    note: "Bruno v3 released January 2026; official Docker image is now usebruno/cli (the AlertBox custom-image workaround may no longer be needed)."
blueskyRecordKey: 3lvs336stus2j
---
<!-- cspell:ignore fastapi,uvicorn,hobbyte,keyserver,usebruno,ECONNREFUSED,davidkarlsen -->
![Bruno - A postman-like tool - GUI and CLI](/img/v2/api.webp)

<TLDR>
This article introduces Bruno, a free, open-source alternative to Postman for API testing. It guides you through setting up a sample Python FastAPI, and then using both the Bruno GUI and CLI to test it. You'll learn how to create requests, manage environments, and run tests from the command line using Docker, including how to handle common networking challenges. The post also covers adding assertions to your tests for validation.
</TLDR>

[Bruno](https://www.usebruno.com/) is a tool like <Link to="/blog/tags/postman">Postman</Link> you can use for free. Everything is stored on your computer so you can store files within your codebase and submit it to your code versioning tool f.i.

*Because those files live in your repository, the CLI part of Bruno turns naturally into a CI job — see <Link to="/blog/gitlab-docker-out-of-docker">GitLab - Running Docker-out-of-Docker in your CI</Link>. And to check the API's contract rather than its answers, there's <Link to="/blog/belgif-api-linter">Validate your OpenAPI schema against the Belgif REST standards</Link>.*

<!-- truncate -->

## Let's install our own APIs first

A few months ago, I wrote <Link to="/blog/python-fastapi">"Python - Fast API - Create your JSON API in Python in one minute"</Link>.

In short, please:

<StepsCard
  variant="steps"
  steps={[
    "Run `mkdir /tmp/fastapi && cd $_` to create a temporary folder and jump in it",
    "Create a `Dockerfile` with the content below",
    "Create a `main.py` with the content below",
    "Run the `docker build -t python-fastapi . && docker run --detach -v .:/app -p 82:82 python-fastapi` command to run the server",
    "Start a browser and open the `http://127.0.0.1:82/jokes` site to see a first joke (press F5 to get a new one; random)"
  ]}
/>

<Snippet filename="Dockerfile" source="./files/Dockerfile" />

<Snippet filename="main.py" source="./files/main.py" />

## Install Bruno

To install Bruno GUI on my Ubuntu distribution, I'm running these commands:

<Terminal typewriter source="./files/terminal-2.txt" />

Please refer to the [Download & Install](https://docs.usebruno.com/get-started/bruno-basics/download) official documentation for more info.

## Run Bruno

Once installed, just start `bruno` from the command line to start the interface:

![Bruno homepage](./images/homepage.webp)

First thing first, let's create a collection:

![Creating a collection](./images/create_collection.webp)

And, because we're smart, let's create an environment too (so we can define our website root URL once):

![Create the root environment variable](./images/environment.webp)

Now, we're ready, let's create a new request:

![Create a request](./images/new_request.webp)

Getting a random joke:

![Getting a random joke](./images/random_joke.webp)

Once the request has been created, press <kbd>CTRL</kbd>+<kbd>ENTER</kbd> or click on the right arrow:

![Running a request](./images/run_request.webp)

## Opening the project with VSCode

By opening the project in VSCode, we can see there is a new folder called `Jokes` (our collection) with very few files like `environments/dev.bru` where we can find our environment's variables, a `bruno.json` generic file then our request in `Get a random joke.bru`.

Very clean structure no?

![The project in VSCode](./images/vscode.webp)

## Running requests from the command line

Bruno comes with a [Docker image](https://hub.docker.com/r/alpine/bruno): it'll help us to automate the execution of our requests from the command line.

<AlertBox variant="caution">
Mid-July 2025, I wasn't able to make this image working as expected. I was facing *Cannot read properties of undefined (reading 'headers')* errors even when, I think, everything was correctly configured.

For that reason, I've searched for another image and I've found that one [davidkarlsen/bruno-image](https://github.com/davidkarlsen/bruno-image) but, no luck, even the last version at that time (version 2.7.0) was giving a problem.

By looking at the [Dockerfile](https://github.com/davidkarlsen/bruno-image/blob/main/Dockerfile), I've seen the file was really easy and a newer version of [Bruno was released](https://github.com/usebruno/bruno/tags); version 2.8.

So, in short, I'll create my own Docker image and check if things are better.

</AlertBox>

### Create our own Bruno CLI image

Let's create a file `bruno.Dockerfile` with the following content:

<Snippet filename="bruno.Dockerfile" source="./files/bruno.Dockerfile" />

We'll create our image like this: `docker build --file bruno.Dockerfile  -t bruno-image .` (we can check our image by running `docker run -it --rm bruno-image --version`; we should see `2.8.0`).

As we've just seen:

- Our collection is stored in the `Jokes` folder and
- our environment is stored in the `environments/dev.bru`.

With this in mind, just run `docker run -it --rm -v "./Jokes":/apps -w /apps alpine/bruno run --env=dev`

![Running for the first time the collection from the CLI](./images/connection_refused.webp)

Ok, something goes wrong. We've fired one request and it has failed. But when running the request from Bruno GUI, it was well working. Why? The answer is: because we are using Docker.

### Understanding why the Bruno CLI Docker container didn't work

Look at the `connect ECONNREFUSED 127.0.0.1:82` error message: the Bruno CLI container is trying to access the 127.0.0.1 webserver but, no, the webserver is running on our host. We have to find a proper way to tell Bruno to reuse our host.

Let's look back at the `environments/dev.bru`:

```none
vars {
  root: http://127.0.0.1:82
}
```

We've created a `root` variable and assign it to `http://127.0.0.1:82` and when we run Bruno GUI, it works.

Why? Because the GUI is running on our host and `127.0.0.1` is our machine. If we do a `curl -v http://127.0.0.1:82/jokes` from the command line, it works too.

<!-- cspell:disable -->

<Terminal typewriter source="./files/terminal-1.txt" />

<!-- cspell:enable -->

We should thus find a solution to make the Bruno Docker CLI container use the correct IP.

### We'll use a new configuration file

Please create the `environments/dev-docker.bru` file like this:

```none
vars {
  host: http://host.docker.internal:82
}
```

That file won't work from the Bruno GUI: we'll be able to select `dev` and it'll work but not `dev-docker`

![Having a second configuration file](./images/second_environment.webp)

But from Bruno CLI container it'll work:

<Terminal typewriter>
$ docker run -it --rm -v "./Jokes":/apps -w /apps \
  --add-host host.docker.internal:host-gateway \
  bruno-image run --env=dev-docker
</Terminal>

![Bruno CLI is working](./images/bruno_cli_is_working.webp)

## Adding some assertions

For sure, the idea of the CLI tool is to be able to run assertions from the command line and make sure the API is still working.

Let's update the `Get a random joke.bru` file like this:

<Snippet filename="Get a random joke.bru" source="./files/Get a random joke.bru" />

![Bruno CLI is running assertions](./images/bruno_cli_assertions.webp)
