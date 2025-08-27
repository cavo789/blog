---
slug: docker-pascal
title: Play with Docker and Pascal
authors: [christophe]
image: /img/experiments_social_media.jpg
mainTag: pascal
tags: [docker, pascal]
---
<!-- cspell:ignore ource,rchive,roupn,chiffre,downto -->
![Play with Docker and Pascal](/img/experiments_banner.jpg)

Good old memories... During my studies (in 1991-1993), I was a huge fan of Turbo Pascal 7.0. It was the first language that I really learned and loves it so much. I used to spend dozens of hours behind my computer writing anything and everything.

If you good remember that time, Turbo Pascal 7.0 was used to create executables for MS-DOS.

The idea for this article came after the one written on <Link to="/blog/docker-assembly">assembly language</Link>: is it possible in 2023 to run Pascal code written 30 years earlier?

<!-- truncate -->

![Turbo Pascal](./images/turbo_pascal.jpg)

The first thing to do was to find some old source code and to do that, I went back to the **S**ource**w**are **A**rchive **G**roup; known as **SWAG**.

The following parametrized query will retrieve some code I've published 30 years ago: [https://www.google.com/search?q=avonture+site%3Ahttp%3A%2F%2Fwww.retroarchive.org](https://www.google.com/search?q=avonture+site%3Ahttp%3A%2F%2Fwww.retroarchive.org). Out of nostalgia, I've also copied these sources here:[https://github.com/cavo789/swag](https://github.com/cavo789/swag).

## Hello world

Please run `mkdir C:\tmp\pascal && cd C:\tmp\pascal` in a MS-DOS console to create a folder called `pascal` and jump in it.

Please create a new file called `Hello.pas` with this content:

<Snippet filename="Hello.pas">

```pascal
begin
  writeln('Hello world! I''m a Turbo Pascal source code');
end.
```

</Snippet>

As you know, Pascal is a compiled language and should then be compiled into an `.exe`. The command below will do this:

<Terminal title="Powershell">
$ docker run -it --rm -v %CD%:/app -w /app signumtemporis/fpc:cross.x86_64-win64.slim Hello.pas
Free Pascal Compiler version 3.2.2 [2021/12/10] for x86_64
Copyright (c) 1993-2021 by Florian Klaempfl and others
Target OS: Win64 for x64
Compiling Hello.pas
Linking Hello.exe
2 lines compiled, 0.1 sec, 32432 bytes code, 1508 bytes data
</Terminal>

Our executable has been created. Time to start it by running `Hello.exe`:

<Terminal title="Powershell">
$ Hello.exe

Hello world! I'm a Turbo Pascal source code
</Terminal>

Voilà, we've successfully created our first Pascal code in 2023.

:::tip Docker CLI reminder
As a reminder, the used Docker run command are (almost always the same):

* `-it` to start Docker interactively, this will allow the script running in the container to ask you for some prompts f.i.,
* `--rm` to ask Docker to kill and remove the container as soon as the script has been executed (otherwise you'll have a lot of exited but not removed Docker containers; you can check this by not using the `--rm` flag then running `docker container list` on the console),
* `-v %CD%:/app` to share your current folder with a folder called `/app` in the Docker container,
* `-w /app` to tell Docker that the current directory, in the container, will be the `/app` folder
* then `signumtemporis/fpc:cross.x86_64-win64.slim` which is the name of the Docker image to use and, finally,
* `Hello.pas` i.e. our source file (the fpc image seems to not request to specify the `fpc` executable; just the source file.
:::

## Convert a number to a byte

Let's try something a *little more complex* than just *Hello world*; a conversion function to determine the byte representation of a positive number *(please be comprehensive; it was a school assignment 😄)*.

I wrote this function in 1992 (published in the *SWAG* in 1997): [https://github.com/cavo789/swag/blob/master/Byte2Bin/files/source.pas](https://github.com/cavo789/swag/blob/master/Byte2Bin/files/source.pas)

Create the `Byte2Bin.pas` file on your disk with this content:

<Snippet filename="Byte2Bin.pas">

```pascal
Function Byte2Bin (Chiffre : Byte) : String;

Var I, Temp : Byte;
    St      : String;

Begin

   St := '';

   For I := 7 Downto 0 do Begin
       Temp := (Chiffre and (1 shl I));
       If (Temp = 0) then St := St + '0' Else St := St + '1';
   End;

   Byte2Bin := St;

End;

begin
    WriteLn( Byte2Bin(197) );
end.
```

</Snippet>

:::info SHL for Shift left one position
The `shl` instruction will shift the number from on byte left.
:::

And compiled it:

<Terminal title="Powershell">
$ docker run -it --rm -v %CD%:/workspace signumtemporis/fpc:cross.x86_64-win64.slim Byte2Bin.pas

Free Pascal Compiler version 3.2.2 [2021/12/10] for x86_64
Copyright (c) 1993-2021 by Florian Klaempfl and others
Target OS: Win64 for x64
Compiling Byte2Bin.pas
Linking Byte2Bin.exe
20 lines compiled, 0.1 sec, 32656 bytes code, 1508 bytes data
</Terminal>

As you can see in the source code, the idea was to show the binary representation of `197` and, yes!, it's indeed `11000101`. Still in 2023.

<Terminal title="Powershell">
$ Byte2Bin.exe
11000101
</Terminal>

OK, so the point of running TP7 code in 2023 is minimal and useless, but it is well fun to see it still works.
