---
slug: docker-java
title: Play with Docker and Java
date: 2023-11-28
description: Learn how to compile and run Java applications using Docker. Set up a Java development environment quickly without local installation, perfect for developers new to Java and Docker.
authors: [christophe]
image: /img/v2/experiments.webp
mainTag: docker
tags: [docker]
language: en
updates:
  - date: 2026-07-30
    note: "Replaced deprecated openjdk:11 Docker Hub image (deprecated Dec 2022) with eclipse-temurin:21 (official Adoptium LTS successor)"
---
![Play with Docker and Java](/img/v2/experiments.webp)

<TLDR>
This article shows how to compile and run Java with zero local install, using the official `openjdk` Docker image: `docker run ... eclipse-temurin:21 javac Main.java` to compile, then `docker run ... eclipse-temurin:21 java Main` to execute, including a second example that calls a REST API from Java and prints the JSON response.
</TLDR>

In this post, we'll play with Docker and Java, using the ready-to-use Java images published on Docker Hub. The only thing you need on your machine is <Link to="/blog/install-docker">Docker itself</Link>.

*The same "zero install, just an image" approach is used on this blog for <Link to="/blog/docker-php-run-script-or-website">PHP</Link>, <Link to="/blog/docker-python-devcontainer">Python</Link> and <Link to="/blog/docker-quarto">Quarto</Link>.*

<AlertBox variant="note" title="I don't know Java at all">
You just need to know that I have absolutely no skills in Java. Which software should be installed, how to run a script and so on? I will just rely on a few Docker commands and, about the installation, yes, using Docker, it is easy: nothing to install, nothing to configure.

</AlertBox>

<!-- truncate -->

## Two commands, and Java runs

One command to compile, one to execute:

<Terminal typewriter wrap={true}>
{`$ docker run -it --rm -v \${PWD}:/app -w /app -u 1000:1000 eclipse-temurin:21 javac Main.java

$ docker run --rm -v $PWD:/app -w /app eclipse-temurin:21 java Main
Hello, World`}
</Terminal>

No JDK on the machine, no `JAVA_HOME`, no `PATH` to fix.

## Why it works

- The `eclipse-temurin:21` image already ships the full JDK, so `javac` and `java` are there, in the exact version the image tag names.
- `-v ${PWD}:/app` shares your current folder with the container: the container reads your `.java` file and writes the `.class` file back into your own folder.
- `-u 1000:1000` runs the container as you, so the generated `Main.class` belongs to your user and not to `root`.

## The source

Please start a Linux shell and run `mkdir -p /tmp/java && cd $_` to create a folder called `java` in your Linux temporary folder and enter it.

Please create a new file called `Main.java` with this content:

<Snippet filename="Main.java" source="./files/Main.java" />

After the first command, your `Main.java` source has been compiled into a `Main.class` file. By running `ls -alh` you can verify that, yes, the java script has been compiled:

<Terminal typewriter source="./files/terminal-1.txt" />

## A slightly more difficult example, calling a REST API

Please create a new file called `API.java` with this content:

<Snippet filename="API.java" source="./files/API.java" />

Compile it by running `docker run --rm -v $PWD:/app -w /app -u 1000:1000 eclipse-temurin:21 javac API.java`; get the `API.class` file.

Finally, call `docker run --rm -v $PWD:/app -w /app eclipse-temurin:21 java API` to execute the API call and display the result on the screen:

<Terminal typewriter>
$ docker run --rm -v $PWD:/app -w /app eclipse-temurin:21 java API
</Terminal>

```json
{
  "userId": 1,
  "id": 1,
  "title": "delectus aut autem",
  "completed": false
}
```

*This example will use the sample `https://jsonplaceholder.typicode.com/todos/1` to generate a fake TODO. The JSON will be displayed on the command line.*

## Under the Hood: the docker run flags (skip this if you just want to use it)

The Docker run commands used above are (almost always the same):

- `-it` to start Docker interactively, this will allow the script running in the container to ask you for some prompts for example,
- `--rm` to ask Docker to kill and remove the container as soon as the script has been executed (otherwise you will have a lot of exited but not removed Docker containers; you can check this by not using the `--rm` flag then running `docker container list` on the console),
- `-v ${PWD}:/app` to share your current folder with a folder called `/app` in the Docker container,
- `-w /app` to tell Docker that the current directory, in the container, will be the `/app` folder,
- `-u 1000:1000` ask Docker to reuse our local credentials so when a file is updated/created in the container, the file will be owned by our user,
- then `eclipse-temurin:21` which is the name and the version of the Docker image to use, and, finally,
- `javac Main.java` i.e. the command line to start within the container.

## Conclusion

Compiling and running Java, including a program that calls a REST API, without a single line of setup on the host: the image carries the toolchain, your folder carries the code, and the container disappears when the command ends. You are ready to start your Java coding journey. Have fun.

Same idea, different language: I've also played with <Link to="/blog/docker-pascal">Pascal</Link>, <Link to="/blog/docker-assembly">Assembly</Link>, and <Link to="/blog/docker-python">Python</Link> using this same "zero local install" Docker approach.
