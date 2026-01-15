---
slug: wsl-windows-explorer
title: Open your Linux folder in Windows Explorer
date: 2023-11-03
description: Access your Linux files in Windows Explorer! Learn the simple command to open your current WSL folder and how to quickly fix the "wsl.localhost is not accessible" error.
authors: [christophe]
image: /img/v2/wsl.webp
mainTag: wsl
tags: [tips, wsl, windows]
language: en
---
<!-- cspell:ignore cbfsconnect -->
![Open your Linux folder in Windows Explorer](/img/v2/wsl.webp)

Did you know it is possible to use the Windows Explorer program and navigate in your Linux filesystem?

An easy way to open your current folder in Windows Explorer is to call the `explorer.exe` binary.

So, for example, in your Linux console, open any existing folder like `cd ~/repositories/blog` and then, just run `explorer.exe .`.

<!-- truncate -->

So, yes, it's possible to call any Windows program (like the calculator (`calc.exe`)) by typing its name followed by `.exe`. If the program is in the `PATH` it will start.

The final `.` means *current folder* so `explorer.exe .` will open the current folder in Windows Explorer.

![Navigating on the Linux filesystem with Explorer.exe](./images/explorer.webp)

It sounds crazy, doesn't it? Windows will then *convert* the Linux `/home/christophe/repositories/blog` folder to `\\wsl.localhost\Ubuntu\home\christophe\repositories\blog` (in the Windows style) and open it. That address is called a UNC (UNC stands for *Uniform Naming Convention*).

Now, I can use Windows explorer to manage files / folders like I have for decades on Windows.

<AlertBox variant="info" title="Windows 11">
If you are running on Windows 11, the UNC is `\\wsl$\`, not `\\wsl.localhost\`.

</AlertBox>

## WSL localhost is not accessible

> [https://github.com/microsoft/WSL/discussions/7742#discussioncomment-6069601](https://github.com/microsoft/WSL/discussions/7742#discussioncomment-6069601).

It can happen, on your Windows 10 computer, that the folder will not be opened and you will get the error: /*\\wsl.localhost is not accessible. You might not have permission to use this network resource. Contact the administrator of this server to find out if you have access permissions.*.

![wsl.localhost not accessible](./images/wsl_localhost_not_accessible.webp)

**It is not a permission problem** but something to modify in your Windows registry.

In Windows, click on `Start - Run` and run `regedit`, the Windows registry editor.

Search for the key `HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\NetworkProvider\Order`, edit the `ProviderOrder` key and add the `P9NP` value to the list. Do the same for `HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\NetworkProvider\HwOrder`.

When done, please reboot your computer.

![Editing the registry](./images/registry.webp)

<AlertBox variant="note" title="">
If it still does not work, remove `cbfsconnect2017` from the list and try again.

</AlertBox>
