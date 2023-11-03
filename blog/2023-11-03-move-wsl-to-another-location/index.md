---
slug: move-wsl-to-another-location
title: Move WSL to another location
authors: [christophe]
tags: [docker, wsl]
---
# Move WSL to another location

> [https://dev.to/mefaba/installing-wsl-on-another-drive-in-windows-5c4a](https://dev.to/mefaba/installing-wsl-on-another-drive-in-windows-5c4a)

By default, the Linux distribution is installed on your C: drive. If, like me, you have a D: drive with almost nothing on it, it can be really interesting to move Linux on that second drive.

To do this, please:

* Run `wsl --list --verbose` from a **PowerShell** console; you'll get the name of your distribution (`Ubuntu` in my case),
* From a **PowerShell Admin** console, run `wsl --terminate Ubuntu` to stop our `Ubuntu` distribution,
* On your second drive, create a temporary folder like `D:\WSL`,
* Run `wsl --export Ubuntu "D:\WSL\Ubuntu.tar"`,
* When finished, run `wsl --unregister Ubuntu` and, finally,
* Run `wsl --import Ubuntu "D:\WSL\Ubuntu" "D:\WSL\Ubuntu.tar"`

You will need to do this for every distribution you have installed and if you want to move it.

:::tip
If you have Docker, you can do the same i.e. move the Docker partition to your second disk.
:::