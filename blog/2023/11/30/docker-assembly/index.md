---
slug: docker-assembly
title: Play with Docker and Assembly programming language
date: 2023-11-30
description: Learn how to combine modern Docker technology with the classic x86 Assembly programming language. This guide provides a step-by-step "Hello, World!" example for both MS-DOS and Linux environments.
authors: [christophe]
image: /img/v2/experiments.webp
mainTag: assembly
tags: [docker, assembly]
language: en
---
<!-- cspell:ignore erminate,esident,esolang,nasm -->
![Play with Docker and Assembly programming language](/img/v2/experiments.webp)

When I was younger than today, during my studies, I was playing with the x86 Assembly language on my `386DX40` computer; this was in the years 1993-1995. The beginning of Windows 3.1 that I did not like. *If someone had asked me if graphical interfaces would be successful, I would have said no, of course not.*

I remember that I wrote a resident program (TSR which stands for **T**erminate and **S**tay **R**esident) which, once loaded into memory, monitored the keyboard and recorded the keys that had been pressed in a file on the hard disk. Yes, it was a password stealer. Just for fun and, above all, for the challenge of it.

And now, in 2023, I was wondering if it was still possible to run `.asm` files on my computer.  It was an excellent reason for this article.

<!-- truncate -->

By searching on [Docker Hub](https://hub.docker.com/), I have found this image: [https://hub.docker.com/r/esolang/x86asm-nasm](https://hub.docker.com/r/esolang/x86asm-nasm)

## Let's play in MS-DOS

Let's test our Docker image in DOS this time. Please start a **DOS** console and run `mkdir C:\tmp\assembly && cd C:\tmp\assembly` to create a folder called `assembly` in your DOS environment and enter it.

Please create a new file called `Hello.asm` with this content:

<Snippet filename="Hello.asm" source="./files/Hello.asm" />

To run the script, just call Docker, like this:

<Terminal title="Powershell">
$ docker run --rm -v %CD%:/code -w /code esolang/x86asm-nasm x86asm-nasm hello.asm
Hello, World! This message comes from Docker.
</Terminal>

<AlertBox variant="info" title="Of course you can play under Linux">
Just replace `%CD%` by `${PWD}` and the instruction will be recognized by Linux: `docker run --rm -v ${PWD}:/code -w /code esolang/x86asm-nasm x86asm-nasm hello.asm`

</AlertBox>
