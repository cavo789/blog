---
slug: docker-assembly
title: Play with Docker and Assembly programming language
authors: [christophe]
image: /img/experiments_social_media.jpg
mainTag: assembly
tags: [docker, assembly]
enableComments: true
---
<!-- cspell:ignore erminate,esident,esolang,nasm -->
![Play with Docker and Assembly programming language](/img/experiments_banner.jpg)

When I was young...er than today, during my studies, I was playing with the x86 Assembly language on my `386DX40` computer; this was in the years 1993-1995. The beginning of Windows 3.1 that I didn't like. *If someone had asked me whether graphical interfaces would be successful, I would have said no, of course not.*

I remember that I wrote a resident program (TSR  for **T**erminate and **S**tay **R**esident) which, once loaded into memory, monitored the keyboard and recorded the keys that had been pressed in a file on the hard disk. And yes, it was a password stealer. Just for fun and, above all, for the challenge it represented.

And now, in 2023, I was wondering whether it was still possible to run `.asm` files on my computer.  It was an excellent pretext for this article.

<!-- truncate -->

By searching on [Docker Hub](https://hub.docker.com/), I've found this image: [https://hub.docker.com/r/esolang/x86asm-nasm](https://hub.docker.com/r/esolang/x86asm-nasm)

## Let's play in MS-DOS

Let's test our Docker image under DOS this time. Please start a **DOS** console and run `mkdir C:\tmp\assembly && cd C:\tmp\assembly` to create a folder called `assembly` in your DOS environment and jump in it.

Please create a new file called `Hello.asm` with this content:

<Snippets filename="Hello.asm">

```assembly
; Our data section (i.e. our variables)
SECTION .data
    ; Our null terminated string
    hello: db 'Hello, World! This message comes from Docker.', 0

; Our entry point
SECTION .text
    global _start

_start:
    mov edx, 45    ; 45 is the length of our "hello" message
    mov ecx, hello ; The name of our variable is "hello"
    mov ebx, 1     ; We'll write to stdout
    mov eax, 4     ; System call number (sys_write)
    int 0x80       ; Triggers software interrupt 80

    mov ebx, 0     ; Next three lines are equivalent to exit 0
    mov eax, 1
    int 0x80
```

</Snippets>

To run the script, just call Docker like this:

```bash
> docker run --rm -v %CD%:/code -w /code esolang/x86asm-nasm x86asm-nasm hello.asm

Hello, World! This message comes from Docker.
```

:::tip Of course you can play under Linux
Just replace `%CD%` by `${PWD}` and the instruction will be recognized by Linux: `docker run --rm -v ${PWD}:/code -w /code esolang/x86asm-nasm x86asm-nasm hello.asm`
:::
