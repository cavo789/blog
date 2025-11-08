---
slug: makefile-using-make
title: Linux Makefile - When to use a makefile
date: 2023-12-27
description: Stop memorizing complex Docker commands. Learn when and how to use a Linux makefile with GNU make to automate your project setup, logging, and environment management.
authors: [christophe]
image: /img/v2/makefile.webp
mainTag: makefile
tags: [makefile, tips]
language: en
---
![Linux Makefile - When to use a makefile](/img/v2/makefile.webp)

Coding your own `makefile` has the enormous, **terribly powerful advantage** of being able to centralize the commands you use on your project in a single place, whatever the nature of the project (php, javascript, nodeJs, markdown, etc.).

The presence of a file called `makefile` sends a clear message to anyone who comes to work on the project: *Hey, have a look here, you'll find all the commands you need*. And it's really easy to list existing commands (see my article <Link to="/blog/makefile-help">Linux Makefile - Adding a help screen</Link>).

So, you can define an `up` command (you choose the name of the command) which will launch all the actions required to start the project; you could have `down` for just the opposite, `check` to check that the project is valid (e.g. launch static checks of the quality of your code), and so on.

<!-- truncate -->

<AlertBox variant="note" title="Only for Linux / WSL (not for DOS/PowerShell)">
This chapter only concern Linux since DOS/PowerShell didn't support the GNU make command.

</AlertBox>

In the <Link to="/blog/docker-joomla">Create your Joomla website using Docker</Link> blog article, we have seen a lot of docker commands.

By alphabetical order:

* `docker compose down`,
* `docker compose exec joomla /bin/sh`,
* `docker compose kill`,
* `docker compose logs --follow`,
* `docker compose up --detach`,
* `docker container list`,
* `docker image list`,
* `docker network list`,
* and many more

It's certainly not easy to remember them all, so why not simplify things by putting them in a `makefile`?

We will use [GNU make](https://www.gnu.org/software/make/) for this.

## Install make

First run `which make` in your Linux console to check if `make` is installed. If so, you will get f.i. `/usr/bin/make` as result. If you got `make not found`, please run `sudo apt-get update && sudo apt-get -y install make` to install it.

This done, we will create a new file called `makefile` in your project's directory. A `makefile` is pure text so you can use any editor you want. On my side, I've now my own habits with Visual Studio Code.

<AlertBox variant="info" title="This file is specific to each project, not global.">
The `makefile`, being created in your project's directory, can contain instructions for that specific project. You could have one `makefile` for each project.

</AlertBox>

Being in your editor with an empty `makefile` file, just copy/paste the content below:

<Snippet filename="makefile" source="./files/makefile" />

Make sure indentation is using tabs, not space.

Save and close vscode.

<AlertBox variant="info" title="Add a help screen">
See my article <Link to="/blog/makefile-help">Linux Makefile - Adding a help screen</Link> to learn how to be able to add a help screen to the list of commands.

</AlertBox>

<AlertBox variant="danger" title="">
The indentation in a makefile **SHOULD BE** made using tabs and not spaces, this is crucial. So please make sure, if your file didn't work, you know what to do.

</AlertBox>

Lines like `adminer:` or `bash:` are called `targets`; it's your commands. Take a look to the `up:` target: you'll retrieve one command and it's `docker compose up --detach`.

So, from now, instead of running (and remember) `docker compose up --detach` to run your application, now, just run `make up` to get the same.

To launch the browser and surf on your site, it will be `make start`.

It's much easier to remember a command like `make something` than remember all Docker commands here (can be everything else, not just Docker).

<AlertBox variant="info" title="Use printf to echo valuable information">
By typing `make phpmyadmin`, it would be nice to see, on the console, the credentials to use and a small tip like this:

<Terminal>
$ make phpmyadmin
User is root and password is example. Please open http://127.0.0.1:8089 to open phpmyadmin.

$ docker run --name phpmyadmin -d --link joomladb:db --network kingsbridge_default -p 8089:80 phpmyadmin
a0c37edd9f8c139556f1f0a6b028ec5102362f16233efbc05f56d184edfb83c9
</Terminal>

To do this, just use the `printf` function like illustrated above.

</AlertBox>

Please read my [Makefile - Tutorial and Tips & Tricks](https://github.com/cavo789/makefile_tips) GitHub repository if you wish to learn more about Make.

Feel free to add your own make instructions; can be multiline.
