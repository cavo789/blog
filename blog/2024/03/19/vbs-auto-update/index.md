---
slug: vbs-auto-update
title: VBS - Auto update script
date: 2024-03-19
description: Automate updates for your VBS (Visual Basic Script) console scripts! Learn how to create a self-updating VBS file that connects to GitHub, checks for new versions, and overwrites itself.
authors: [christophe]
image: /img/v2/vbs.webp
series: VBA & MS Office automation
mainTag: github
tags:
  - github
  - vba
  - windows
language: en
review_date: 2026-07-30
---
![VBS - Auto update script](/img/v2/vbs.webp)

<TLDR>
This article shows how to give a VBScript (VBS) file a self-update capability: on each run, the script downloads its own source from a public GitHub URL, compares it to the local copy, and overwrites itself if a newer version is found — letting distributed `.vbs` utilities stay current without manual redistribution.
</TLDR>

Before switching to <Link to="/blog/tags/wsl">WSL2</Link> and the Linux console, I wrote VBS scripts from time to time. It looks like VBA but for the DOS console.

A VBS script for DOS is a text file written in the Visual Basic Scripting Edition (VBScript) programming language that can be executed directly from the DOS command prompt. It allows you to automate tasks and perform repetitive operations on your computer.

It's just like <Link to="/blog/tags/bash">Linux Bash</Link> scripts but for DOS.

*Three VBS utilities of mine that would benefit from exactly this self-update mechanism: <Link to="/blog/vbs-msaccess-get-fields">VBS - Retrieve the list of fields in a MS Access Database</Link>, <Link to="/blog/vba-access-export">Export MS Access objects</Link> and <Link to="/blog/vbs-files-csv">VBS - Get list of files and generate a CSV</Link>.*

Do you think it would be possible to offer an auto-update function in such scripts? The answer is yes.

<!-- truncate -->

Imagine a script called `get_folder_size.vbs` you've publicly saved on GitHub (source [https://github.com/cavo789/vbs_utilities/blob/master/src/folders/get_folder_size/get_folder_size.vbs](https://github.com/cavo789/vbs_utilities/blob/master/src/folders/get_folder_size/get_folder_size.vbs)).

Someone downloads it to their computer and enjoys using it.

By adding a new *auto-update* function to it, each time the script starts, a connection to GitHub is made first, the script is downloaded from there, and a check is made to see if the downloaded version is different; if so, the script overwrites itself.

Here is the content of such function:

<Snippet filename="get_folder_size.vbs" source="./files/get_folder_size.vbs" />
