---
slug: linux-bash-too-many-function-parameters
title: Clean code - Linux Bash - Keep the number of function parameters as small as possible
date: 2024-06-28
description: Apply Clean Code to your Linux Bash scripts. Discover how to avoid too many function parameters by using a simple, robust associative array solution.
authors: [christophe]
image: /img/v2/bash.webp
mainTag: code-quality
tags: [code-quality, linux, tips]
language: en
---
![Clean code - Linux Bash - Keep the number of function parameters as small as possible](/img/v2/bash.webp)

A concept of the clean code approach is to avoid too many function parameter (I would say that four parameters is already too many).

When you're programming in a language more advanced than Linux Bash, it's easy to get round the problem. For example, in PHP, if I need to call a function and pass it several parameters, I'll create an object that will be my only parameter and that object will then have several properties.

So, for instance, if I need to pass data such as a surname, first name, date of birth, gender, etc., I'll create a `person` object, define my properties and voilà, I've only got one parameter to pass to my function. In most cases, it'll be a very nice solution.

But how do you do it in Linux Bash? It's impossible to pass an object... so I'm going to pass it an associative array.

<!-- truncate -->

The trick, for a Bash script, is to define an associative array (created with the command `declare -A arr=()`) and pass this array as a parameter to the function.

Below is an example:

<Snippet filename="curl.sh" source="./files/curl.sh" />

One of the big advantages is that you don't have to worry about the position of the arguments (ah yes, so the first parameter is the url, the second is the HTTP method, the third is, er? the proxy? ah no, damn).

New parameters can also be created in the future without affecting existing scripts in any way.

Everything is much cleaner using an associative array and more robust too.