---
slug: bash-ascii-art
title: Bash - ASCII art
date: 2023-12-19
description: Learn how to add eye-catching ASCII art banners to your Bash scripts for a bigger visual impact. Includes a full sample code implementation.
authors: [christophe]
image: /img/v2/ascii_art.webp
mainTag: bash
tags: [bash, tips]
language: en
---
![Bash - ASCII art](/img/v2/ascii_art.webp)

I write a lot of Bash scripts, and I like to have a similar approach for each one. One of the things I always do is to include a good old-fashioned *ASCII Art* banner, perhaps for the geek factor, but mostly to make a bigger visual impact.

I use [https://patorjk.com/software/taag](https://patorjk.com/software/taag) to create my banners, so let's take a closer look.

![Sample ASCII art](./images/sample.png)

<!-- truncate -->

On my hand, I'm implementing the banner like this:

<Snippet filename="script.sh" source="./files/script.sh" />

And this is how it'll look like in my bash terminal:

![Terminal](./images/terminal.png)
