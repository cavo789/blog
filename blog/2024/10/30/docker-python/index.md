---
slug: docker-python-devcontainer
title: Docker - Python devcontainer
date: 2024-10-30
description: Learn how to quickly set up a VSCode devcontainer for Python development using Docker. Get the full Dockerfile, compose.yaml, and .docker.env configurations.
authors: [christophe]
image: /img/v2/devcontainer.webp
series: Coding using a devcontainer
mainTag: python
tags: [devcontainer, docker, python]
language: en
---
<!-- cspell:ignore PYTHONDONTWRITEBYTECODE,PYTHONUNBUFFERED,HISTFILE -->
<!-- cspell:ignore addgroup,adduser,keyscan,hadolint,gecos,endregion -->
<!-- cspell:ignore bashhistory,groupid,commandhistory,pylint,synchronised -->
![Docker - Python devcontainer](/img/v2/devcontainer.webp)

As you know, VSCode is a superb editor that lets you program in probably any programming language.  An editor, not an IDE, because VSCode is basically a Notepad in its ultimate version.

If you want to program in Python, you'll need to install a few extensions in VSCode to be really comfortable, i.e. syntax highlighting, code navigation, code refactoring (like renaming a variable or a class), etc.

There are ‘ready-to-use’ editors like PyCharm but 1. they cost money and 2. they are specific (you won't be able to program in PHP with PyCharm; or even work easily with HTML/CSS files).

In this new article, we'll look at how to get a VSCode environment ready to use straight away for coding in Python, and as it's VSCode it's 1. free, 2. multi-purpose and 3. insanely powerful.

<!-- truncate -->

In this article, we'll create a **devcontainer** i.e. a development environment based on Docker. The creation of the devcontainer will take a few minutes but it's just a question of copy/paste from this article to your system.

Once files will be created, you can then reuse the devcontainer for all your Python projects.

## Let's create the files for our Docker environment

Like always, we'll create a new folder and create files there. Please run `mkdir /tmp/python && cd $_` to create that folder and jump in it.

Start VSCode from there i.e. run `code .-` in the console when you're located in the folder. This will open VSCode and you'll be able to create as many files you want.

### Dockerfile

The first file to create will be used to build our Docker image. Please create a file called `Dockerfile` with the following content:

<Snippet filename="Dockerfile" source="./files/Dockerfile" />

### compose.yaml

Next to the `Dockerfile`, we'll create our `compose.yaml` one. Please create that file with the following content:


<Snippet filename="compose.yaml" source="./files/compose.yaml" />

### .docker.env

The third file to create will be called `.docker.env` where we'll initialise some values. Please create that file with the content below:


<Snippet filename=".docker.env" source="./files/.docker.env" />

<AlertBox variant="info" title="">
All you have to do is duplicate the other files we've created for each of your projects and the settings for your project will be made here, in the `.docker.env` file.

</AlertBox>

### makefile

To make life easier, we're going to group together a set of commands in a file called `makefile`. Please create a `makefile` file with the contents below:

<Snippet filename="makefile" source="./files/makefile" />

<AlertBox variant="caution" title="">
If you don't know if you already have `GNU make`, just run `which make` in the console. If you see `make not found` then please run `sudo apt-get update && sudo apt-get install make` to proceed the installation.

</AlertBox>

Right now, we can run `make up` in our console and we'll get this screen:

![Makefile](./images/make.png)

As you can see, we've a lot of commands like `make up` to start our Docker container. Let's try and, ouch, we miss a file called `/src/requirements.txt`.

![requirements.txt is missing](./images/requirements_txt.png)

### src/requirements.txt

Please create an empty file called `src/requirements.txt`. The file can stay empty (you'll add your own requirements later on).

By running `make up` again, yes!, this time we can build our images and create our container:

![Docker up](./images/docker-up.png)

This time we can, if you need to, enter in our container by running `make bash` and f.i. what is inside our current folder and which version of Python has been installed:

![Inside the container](./images/container-python.png)

<AlertBox variant="note" title="">
As you see, Python 3.13 is used. Why that specific version? Just go back to your `.docker.env` file and take a look to the `DOCKER_PYTHON_VERSION` variable. If you need another just update the `.docker.env` file and run `make up` again.

</AlertBox>

## Let's start creating our first script

If you're still inside your container, please type `exit` so your prompt will be the one of your machine (your *host*); no more the one of your running container.

Please create your first script: create a new file in the `src` folder and call that file `hello.py`.

Be creative and type a simple `print` statement:

```python
print("I'm your Python code")
```

![Hello](./images/hello.png)

To be able to run the code, start `make bash` again (to jump in the container) and start `python hello.py`

![Run hello](./images/run-hello.png)

<AlertBox variant="info" title="">
It will works because, in the container, the working directory is `/app/src`. If this had not been the case, we would have had to write, for example, `python /app/src/hello.py` i.e. the absolute path to the script.

</AlertBox>

As you can see, files on your machine are synchronised with your host. If VSCode is still open, you can change your script to f.i.

```python
print("Hey! It's synchronised; cool!")
```

![It's synchronised](./images/it-is-synchronized.png)

## What have we done so far?

We have created the minimal structure for our future Python projects. We've defined our Docker image (thanks to the `Dockerfile` file) and how to use it (`compose.yaml` file).

We've also configured our project (`.docker.env` file) and set up a number of useful commands (`makefile` file).

All these files can be used across all your Python projects.

## Now, let's create our devcontainer environment

We've to create an additional file. Please create a new folder called `.devcontainer` and, there, a file called `devcontainer.json`. Copy/paste the content below:

<Snippet filename=".devcontainer/devcontainer.json" source="./files/devcontainer.json" />

This file is very long; can be shorter but ... the idea is to configure VSCode so we've specified all extensions we want in our coding environment and a bunch of settings.

We've finished our set-up. Here is our final project's structure:

![Our final project's structure](./images/final-structure.png)

## Start the project in a devcontainer

If VSCode is still open, please close it. If you're still in the container's console, please type `exit` to go back to your host console.

Now, please run `make devcontainer` (on your host machine thus) which is one of the command we've already in our `makefile`.

VSCode will start and open the project directly *inside* the container:

![VSCode - Devcontainer](./images/vscode_devcontainer.png)

VSCode will ask (see bottom right) to install the Microsoft Python extension; just allow this and click on `Install`.

VSCode will also ask if you want to install recommended extensions; please do it.

![Install recommended extensions](./images/vscode_install_extensions.png)

## Conclusion

You've now a fully coding environment to work with Python. Thanks to our Docker image, Python has been installed and configured to run in a Docker container (understand: nothing was installed on your machine) and thanks to the Devcontainer, you're sure that VSCode is properly configured with all required extensions to work with ease.
