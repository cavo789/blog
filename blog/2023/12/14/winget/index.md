---
date: 2023-12-14
slug: windows-winget
title: Update all out-of-date Windows programs in batch
authors: [christophe]
image: /img/v2/windows_tips.jpg
mainTag: windows
tags: [tips, windows, winget]
---
![Update all out-of-date Windows programs in batch](/img/v2/windows_tips.jpg)

> [Use the winget tool to install and manage applications](https://learn.microsoft.com/en-us/windows/package-manager/winget/)

If you're working under Linux or WSL, you know very well the `sudo apt-get update && sudo apt-get upgrade` instruction to ask the operating system to upgrade programs present on your disk with newer version.

Under Windows, since a few years (starting with Windows 10), there is such command too: it's `winget`.

<!-- truncate -->

By running `winget upgrade --all --silent` in **a DOS (or Powershell) console** started with admin rights, you'll start a process that will scan (in a second) your computer, detect which programs are installed on it and check if a newer version exists (and known by winget).

![Starting winget](./images/start-winget.png)

Then, because we've added the `--all --silent` flags, we just allow winget to process to the updates without asking confirmation. Let the computer do his work during a few minutes and... tadaaa... you've fresh and updated versions of your software *(the ones supported by winget)*.

![Running winget](./images/running-winget.png)

Winget has detected that 17 software should be upgraded and, one by one, will download and install newer versions.

Easy no?

:::tip Including unknown ones
[Marc Dechèvre](https://www.woluweb.be/) tells me that `winget upgrade --all --silent` command found 29 updates to make on his machine and that adding the `--include-unknown` flag found 15 more.
:::

## Getting the list of softwares

Running `winget list` returns the list of all softwares installed on your machine and `winget list --upgrade-available` only those when a newer version is available on the internet.

And, to get the list sorted, make sure you're under **PowerShell** and run this command instead: `winget list --upgrade-available | Sort-Object`. The result isn't really nice but, at least, application names are sorted.

## Upgrade just one application

By running `winget upgrade Docker` f.i. you'll upgrade only that one.
