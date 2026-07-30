---
slug: move-wsl-to-another-location
title: Move WSL to another location
date: 2023-11-03
description: Running low on C drive space? Follow this step-by-step guide to safely move your WSL (Windows Subsystem for Linux) distribution and Docker data to a new drive location using the wsl --export and wsl --import commands.
authors: [christophe]
image: /img/v2/wsl.webp
mainTag: wsl
tags:
  - docker
  - wsl
language: en
review_date: 2026-07-30
---
![Move WSL to another location](/img/v2/wsl.webp)

> [https://dev.to/mefaba/installing-wsl-on-another-drive-in-windows-5c4a](https://dev.to/mefaba/installing-wsl-on-another-drive-in-windows-5c4a)

<TLDR>
This article shows how to move a WSL2 distribution off the C: drive to free up space, using `wsl --shutdown`, `wsl --export` to a `.tar` file, `wsl --unregister` to remove the original, and `wsl --import` to recreate it on another drive — the same export/unregister/import pattern also works to relocate the Docker Desktop WSL partition.
</TLDR>

By default, the Linux distribution is installed on your C: drive. If, like me, you have a D: drive with almost nothing on it, it can be really interesting to move Linux to that second drive.

*Once moved, nothing else changes: your distribution keeps working exactly as before, <Link to="/blog/wsl-windows-explorer">including opening your Linux folders in Windows Explorer</Link>.*

<!-- truncate -->

To do this:

- Run `wsl --list --verbose` from a **PowerShell** console; you will get the name of your distribution (`Ubuntu` in my case),
- From an **administrator PowerShell** console,
  - Run `wsl --shutdown` to shutdown WSL,
  - On your second drive, create a temporary folder like `d:\wsl`,
  - Run `wsl --export Ubuntu d:\wsl\ubuntu.tar`,
  - When finished, run `wsl --unregister Ubuntu` and then,
  - Run `wsl --import Ubuntu d:\wsl\ubuntu d:\wsl\ubuntu.tar --version 2`
  - Run `del d:\wsl\ubuntu.tar`

You will need to do this for every distribution you have installed that you want to move.

<AlertBox variant="info">
If you have Docker, you can do the same and move the Docker partition to your second disk.

<Terminal typewriter title="Powershell" source="./files/terminal-1.txt" />


</AlertBox>

Once done, restart your computer to finalize the move.
