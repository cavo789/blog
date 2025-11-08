---
slug: docker-java
title: Play with Docker and Java
date: 2023-11-28
description: Learn how to compile and run Java applications using Docker. Set up a Java development environment quickly without local installation, perfect for developers new to Java and Docker.
authors: [christophe]
image: /img/v2/experiments.webp
mainTag: java
tags: [docker, java]
language: en
---
![Play with Docker and Java](/img/v2/experiments.webp)

In this post, we'll play with Docker and Java. Since there are ready-to-use Java images for Docker you don't need to install or configure anything other than Docker.

<AlertBox variant="note" title="I don't know Java at all">
You just need to know, I've absolutely no skills in Java. Which software should be installed, how to run a script and so on. I'll just rely on a very few Docker commands and, about the installation, yeah, using Docker, it's easy: nothing to install, nothing to configure.

</AlertBox>

<!-- truncate -->

Please start a Linux shell and run `mkdir -p /tmp/java && cd $_` to create a folder called `java` in your Linux temporary folder and jump in it.

Please create a new file called `Main.java` with this content:

<Snippet filename="Main.java" source="./files/Main.java" />

Now, you'll need to compile your source. For this, just run `docker run -it --rm -v ${PWD}:/app -w /app -u 1000:1000 openjdk:11 javac Main.java`.

<AlertBox variant="info" title="Docker CLI reminder">
As a reminder, the used Docker run command are (almost always the same):

* `-it` to start Docker interactively, this will allow the script running in the container to ask you for some prompts f.i.,
* `--rm` to ask Docker to kill and remove the container as soon as the script has been executed (otherwise you'll have a lot of exited but not removed Docker containers; you can check this by not using the `--rm` flag then running `docker container list` on the console),
* `-v ${PWD}:/app` to share your current folder with a folder called `/app` in the Docker container,
* `-w /app` to tell Docker that the current directory, in the container, will be the `/app` folder,
* `-u 1000:1000` ask Docker to reuse our local credentials so when a file is updated/created in the container, the file will be owned by us,
* then `openjdk:11` which is the name and the version of the Docker image to use, and, finally,
* `javac Main.java` i.e. the command line to start within the container.

</AlertBox>

As a result of this command, your `Main.java` source will be compiled into the `Main.class` file.

By running `ls -alh` you can verify that, yes, the java script has been compiled into a `.java` file.

<Terminal>
$ ls -alh
total 24K
drwxr-xr-x  2 christophe christophe 4.0K Nov 22 15:02 .
drwxrwxrwt 29 root       root        12K Nov 22 14:58 ..
-rw-r--r--  1 christophe christophe  414 Nov 22 15:02 Main.class
-rw-r--r--  1 christophe christophe  117 Nov 22 14:58 Main.java
</Terminal>

<AlertBox variant="info" title="And without to have to install something">
Once again, you don't have install or configure something; just call the Docker image *that goes well*.

</AlertBox>

Last thing is to execute your Java program. Now, please run `docker run --rm -v $PWD:/app -w /app openjdk:11 java Main` to execute it.

<Terminal>
$ docker run --rm -v $PWD:/app -w /app openjdk:11 java Main
Hello, World
</Terminal>

## A little more difficult, calling a REST API

Please create a new file called `API.java` with this content:

<Snippet filename="API.java" source="./files/API.java" />

Compile it by running `docker run --rm -v $PWD:/app -w /app -u 1000:1000 openjdk:11 javac API.java`; get the `API.class` file.

Finally, call `docker run --rm -v $PWD:/app -w /app openjdk:11 java API.java` to execute the API call and display the result on screen:

<Terminal>
$ docker run --rm -v $PWD:/app -w /app openjdk:11 java API.java
</Terminal>

```json
{
  "userId": 1,
  "id": 1,
  "title": "delectus aut autem",
  "completed": false
}
```

*This example will use the sample `https://jsonplaceholder.typicode.com/todos/1` to generate one fake TODO. The JSON will be displayed on the command line.*

You're ready to start your Java's coding journey. Have fun.
