---
slug: docker-python
title: Play with Docker and Python
date: 2023-11-29
description: Forget complex Python setup. Learn how to quickly run your Python scripts using Docker containers, from "Hello World" to a Hangman game, and simplify your development.
authors: [christophe]
image: /img/v2/python.webp
tags: [docker, python]
language: en
---
![Play with Docker and Python](/img/v2/python.webp)

Remember a few years ago when you wanted to learn a new programming language such as Python?  What did you need before you could even start programming your first *Hello World*? You had to install the language on your computer; maybe you also had to get a lot of libraries/dependencies; you had to spend time configuring your machine before you could even start writing your first script.

That's all over with the advent of Docker and the concept of containers.

This time, we'll play with Python for this article. **I'm discovering Python at the same time as writing this article: at this precise moment, I've never written `.py` scripts.**

<!-- truncate -->

## Welcome to the world

Please start a Linux shell and run `mkdir -p /tmp/python && cd $_` to create a folder called `python` in your Linux temporary folder and jump in it.

Please create a new file called `Hello.py` with this content:

<Snippet filename="Hello.py" source="./files/Hello.py" />

Ok, so now, how to run that script? Because I'm familiar with Docker, I know that:

1. I need a Python Docker image ([https://hub.docker.com/_/python](https://hub.docker.com/_/python)),
2. I'll need to use a `docker run` command line instruction,
3. I'll need share my script using a volume and
4. I need to know how to run the script.

<Terminal>
$ {`docker run -it --rm -v \${PWD}:/app -w /app python python Hello.py`}
Hello World!
</Terminal>

And voilà, my first Python script has been written. Remember the old days, before Docker, how many hours and how much reading did you need to be able to run your first script? **Here, it didn't take me five minutes to get up and running.**

<AlertBox variant="info" title="Docker CLI reminder">
As a reminder, the used Docker run command are (almost always the same):

* `-it` to start Docker interactively, this will allow the script running in the container to ask you for some prompts f.i.,
* `--rm` to ask Docker to kill and remove the container as soon as the script has been executed (otherwise you'll have a lot of exited but not removed Docker containers; you can check this by not using the `--rm` flag then running `docker container list` on the console),
* `-v ${PWD}:/app` to share your current folder with a folder called `/app` in the Docker container,
* `-w /app` to tell Docker that the current directory, in the container, will be the `/app` folder
* then `python` which is the name of the Docker image to use (you can also specify a version like `python:3.9.18` if needed; see [https://hub.docker.com/_/python/tags](https://hub.docker.com/_/python/tags)) and, finally,
* `python Hello.py` i.e. the command line to start within the container.

</AlertBox>

## Playing the hangman

As said above, in November 2023, I don't have start to learn Python so let's try to find some sample scripts. On [https://hackr.io/blog/python-projects](https://hackr.io/blog/python-projects), we can find a Hangman script.

Please create the `Hangman.py` file onto your disk with this content:

<Snippet filename="Hangman.py" source="./files/Hangman.py" />

Then, run it using `docker run -it --rm -v ${PWD}:/app -w /app python python Hangman.py` and good luck:

```none
Hangman Word: ______ Enter your guess:
A
   _____
  |
  |
  |
  |
  |
  |
__|__

Wrong guess: 4 guesses remaining

Hangman Word: ______ Enter your guess:
E
   _____
  |     |
  |     |
  |
  |
  |
  |
__|__

Wrong guess: 3 guesses remaining

Hangman Word: ______ Enter your guess:
I
   _____
  |     |
  |     |
  |     |
  |
  |
  |
__|__

Wrong guess: 2 guesses remaining

Hangman Word: ______ Enter your guess:
C
   _____
  |     |
  |     |
  |     |
  |     O
  |
  |
__|__

Wrong guess: 1 guesses remaining

Hangman Word: ______ Enter your guess:
O
   _____
  |     |
  |     |
  |     |
  |     O
  |    /|\
  |    / \
__|__

Wrong guess. You've been hanged!!!

The word was: border
Do You want to play again? y = yes, n = no
```

Damned, I lost.

It's up to you to find out... You'll find a script that will [test the strength of a password](https://hackr.io/blog/python-projects#toc-6-password-strength-checker); it's up to you to create the `check_password.py` script and run it on your machine.