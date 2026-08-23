---
slug: makefile-using-make
title: Linux Makefile - When to use a makefile
date: 2023-12-27
description: Stop memorizing complex Docker commands. Learn when and how to use a Linux makefile with GNU make to automate your project setup, logging, and environment management.
authors: [christophe]
image: /img/v2/makefile.webp
mainTag: makefile
tags:
  - docker
  - linux
  - makefile
language: en
review_date: 2026-07-30
---
![Linux Makefile - When to use a makefile](/img/v2/makefile.webp)

<TLDR>
This article makes the case for a project `makefile` (Linux/WSL only) as a single place to centralize otherwise-hard-to-remember commands — turning something like `docker compose up --detach` into `make up` — and shows a basic starter file with targets for common Docker actions, plus a tip on using `printf` to echo useful info (like credentials) when a target runs.
</TLDR>

Coding your own `makefile` has the enormous, **terribly powerful advantage** of being able to centralize the commands you use on your project in a single place, whatever the nature of the project (php, javascript, nodeJs, markdown, etc.).

The presence of a file called `makefile` sends a clear message to anyone who comes to work on the project: *Hey, have a look here, you'll find all the commands you need*.

So, you can define an `up` command (you choose the name of the command) which will launch all the actions required to start the project; you could have `down` for just the opposite, `check` to check that the project is valid (e.g. launch static checks of the quality of your code, as in <Link to="/blog/python-qa">Python - Code Quality tools</Link>), and so on.

<!-- truncate -->

## One word instead of that command

<Vars
  port_adminer="8088"
  port_phpmyadmin="8089"
  network="kingsbridge_default"
  db="joomladb"
  labels={{ port_adminer: "Adminer port", port_phpmyadmin: "phpMyAdmin port", network: "Docker network", db: "Database container" }}
/>

Here is a `make phpmyadmin` call, and just below it, the Docker command it stands for:

<Terminal typewriter source="./files/terminal-1.txt" />

One word on the left. A hundred and twenty characters of `--link`, `--network` and `-p` on the right — the kind of line nobody types from memory, and everybody ends up hunting for in their shell history.

And notice the second line of the output: the credentials and the URL are printed too, so you don't have to look them up either.

## What's inside the makefile

That whole behavior comes from a plain text file at the root of the project:

<Snippet filename="makefile" source="./files/makefile" />

Lines like `adminer:` or `bash:` are called `targets`; they are your commands. Take a look at the `up:` target: you'll retrieve one command and it's `docker compose up --detach`. So instead of remembering `docker compose up --detach` to run your application, you just run `make up`. To launch the browser and surf on your site, it will be `make start`.

The credentials shown above are printed by a `printf` call inside that target — a good habit for anything you'd otherwise have to look up.

<AlertBox variant="danger">
The indentation in a makefile **SHOULD BE** made using tabs and not spaces, this is crucial. So please make sure, if your file didn't work, you know what to do.

</AlertBox>

<AlertBox variant="info" title="This file is specific to each project, not global.">
The `makefile`, being created in your project's directory, can contain instructions for that specific project. You could have one `makefile` for each project.

</AlertBox>

## Why bother

In the <Link to="/blog/docker-joomla">Create your Joomla website using Docker</Link> blog article, we have seen a lot of docker commands.

By alphabetical order:

- `docker compose down`,
- `docker compose exec joomla /bin/sh`,
- `docker compose kill`,
- `docker compose logs --follow`,
- `docker compose up --detach`,
- `docker container list`,
- `docker image list`,
- `docker network list`,
- and many more

It's certainly not easy to remember them all — and it's much easier to remember a command like `make something` (and it can be anything, not just Docker).

<Details label="`make` is not installed yet?">

We use [GNU make](https://www.gnu.org/software/make/) for this.

First run `which make` in your Linux console to check if `make` is installed. If so, you will get f.i. `/usr/bin/make` as a result. If you got `make not found`, please run `sudo apt-get update && sudo apt-get -y install make` to install it.

The `makefile` itself is pure text so you can use any editor you want. On my side, I've now my own habits with Visual Studio Code. Make sure indentation is using tabs, not spaces.

<AlertBox variant="note" title="Only for Linux / WSL (not for DOS/PowerShell)">
This chapter only concerns Linux since DOS/PowerShell doesn't support the GNU make command.

</AlertBox>

</Details>

## Conclusion

A `makefile` at the root of a project is a message to whoever opens it next — including yourself in six months: *everything you need to run this thing is here*. The commands stop living in your shell history and start living in the repository, versioned alongside the code they operate on.

The obvious next step is to make that list self-documenting: <Link to="/blog/makefile-help">Linux Makefile - Adding a help screen</Link> shows how a bare `make` can print every available target with its description. And once you're convinced, <Link to="/blog/makefile_tips">Makefile - Tutorial and Tips & Tricks</Link> collects everything I've learned since writing my first one.
