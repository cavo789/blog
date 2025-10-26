---
slug: vbs-auto-update
title: VBS - Auto update script
date: 2024-03-19
description: Automate updates for your VBS (Visual Basic Script) console scripts! Learn how to create a self-updating VBS file that connects to GitHub, checks for new versions, and overwrites itself.
authors: [christophe]
image: /img/v2/vbs.webp
mainTag: github
tags: [dos, github, vbs]
language: en
---
![VBS - Auto update script](/img/v2/vbs.webp)

Before switching to <Link to="/blog/tags/wsl">WSL2</Link> and the Linux console, I wrote VBS scripts from time to time. It looks like VBA but for the DOS console.

A VBS script for DOS is a text file written in the Visual Basic Scripting Edition (VBScript) programming language that can be executed directly from the DOS command prompt. It allows you to automate tasks and perform repetitive operations on your computer.

It's just like <Link to="/blog/tags/bash">Linux Bash</Link> scripts but for the DOS.

Do you think it would be possible to offer an auto-update function in such scripts? The answer is yes.

<!-- truncate -->

Imagine a script called `get_folder_size.vbs` you've publicly saved on Github (source [https://github.com/cavo789/vbs_utilities/blob/master/src/folders/get_folder_size/get_folder_size.vbs](https://github.com/cavo789/vbs_utilities/blob/master/src/folders/get_folder_size/get_folder_size.vbs)).

Someone download it his computer and enjoy using it.

By adding to it a new *auto-update* function, each time the script will be started, first, a connection to Github will be made, download the script from there and a check will be made if the downloaded version is different and, if so, the script will be overridden.

Here is the content of such function:

<Snippet filename="get_folder_size.vbs" source="./files/get_folder_size.vbs" />