---
slug: wslg-rpd-connection
title: Opening an RDP connection to the Linux local instance
date: 2023-11-02
description: Learn how to open an RDP connection to your WSLg Linux instance (Ubuntu) for a full graphical desktop environment. Follow this step-by-step guide to installing and configuring xrdp.
authors: [christophe]
image: /img/v2/wsl.webp
mainTag: wsl
tags:
  - docker
  - windows
  - wsl
language: en
---
![Opening an RDP connection to the Linux local instance](/img/v2/wsl.webp)

> [https://www.nextofwindows.com/how-to-enable-wsl2-ubuntu-gui-and-use-rdp-to-remote](https://www.nextofwindows.com/how-to-enable-wsl2-ubuntu-gui-and-use-rdp-to-remote)
> [https://medium.com/@riley.kao/wsl2-ubuntu20-04-gui-remote-desktop-connection-rdp-2bbd21d2fa71](https://medium.com/@riley.kao/wsl2-ubuntu20-04-gui-remote-desktop-connection-rdp-2bbd21d2fa71)

<TLDR>
This article shows how to RDP into a WSL2 Ubuntu instance: installing and starting `xrdp` (on a non-default port like 3390 to avoid conflicts), connecting from Windows via `mstsc.exe`, and installing a full Xfce desktop environment (`xubuntu-desktop`) with `startwm.sh` reconfigured to launch it, so the RDP session shows a full graphical desktop instead of just a console.
</TLDR>

When WSLg is enabled, it's possible to access the graphical user interface of your Linux distribution (in my case, it's Ubuntu).

*This gives you the **whole desktop** of your WSL instance. Two other approaches exist for graphical Linux on Windows: <Link to="/blog/docker-run-linux-gui">running a single application from a container</Link> and <Link to="/blog/docker-lubuntu">starting a full lubuntu desktop in Docker</Link>. And for files only, <Link to="/blog/wsl-windows-explorer">Open your Linux folder in Windows Explorer</Link> is far lighter than an RDP session.*

If you don't have `xrdp` yet, you can install it by running:

<Terminal typewriter>
$ sudo apt update && sudo apt -y upgrade
...
$ sudo apt-get install -y xrdp
...
</Terminal>

<!-- truncate -->

Also consider changing the port number to `3390` by running the command below and making a few minor changes. *This seems to be required because, when using the default 3389 port number, you get the 'already in use' error with mstsc.*

<Terminal typewriter source="./files/terminal-2.txt" />

(see [https://www.nextofwindows.com/how-to-enable-wsl2-ubuntu-gui-and-use-rdp-to-remote](https://www.nextofwindows.com/how-to-enable-wsl2-ubuntu-gui-and-use-rdp-to-remote) for more in-depth information)

Once done, run `sudo service xrdp start` to start the service. You will see the `* Starting Remote Desktop Protocol server` notification in the console.

Go back to your Windows environment and start `mstsc.exe` and set the computer name to `localhost:3390` (or the port number you are using).

![Start the RDP connection](./images/rdp_localhost.webp)

<AlertBox variant="caution">
The connection is only possible when `xrdp` is started. So, if it does not work, you know what to do (you can also run `sudo service xrdp status` to get detailed information).

</AlertBox>

![Authentication screen](./images/authentication.webp)

Use your local Linux user and connect.

![Desktop screen](./images/desktop.webp)

## Get the desktop environment

By default, you will just get a bash console and not the desktop as illustrated on the image above.

If you wish the desktop and all its features, please run `sudo apt-get install -y xubuntu-desktop xfce4 xfce4-goodies`. You will be prompted to make a choice between `gdm3` or `lightdm`; select the first one to get all features.

Also run `sudo nano /etc/xrdp/startwm.sh` to edit the file.

1. Comment out the last two lines:

    <Snippet filename="/etc/xrdp/startwm.sh">

    ```bash
    # test -x /etc/X11/Xsession && exec /etc/X11/Xsession
    # exec /bin/sh /etc/X11/Xsession
    ```

    </Snippet>

2. Add these last two lines:

    <Snippet filename="/etc/xrdp/startwm.sh">

    ```bash
    # xfce4
    startxfce4
    ```

    </Snippet>

Finally enable `dbus`:

<Terminal typewriter source="./files/terminal-1.txt" />

Run `sudo service xrdp restart` to restart the Remote Desktop Protocol Server and start `mstsc.exe` again. Now, you should have the full desktop.

<AlertBox variant="info">
When you don't need RDP anymore, free up some resources by running `sudo service xrdp stop` in your Linux console.

</AlertBox>

### Set your keyboard

By default, the keyboard is set to `QWERTY` so go to `Applications` → `Settings` → `Keyboard`.

![Set your keyboard](./images/settings_keyboard.webp)

In the third tab, find your own keyboard setting. If you are using the `Français - Belgique` on Windows, you should set your keyboard to `Belgian (alt.)` on Ubuntu.

![Set your keyboard to Belgian](./images/settings_keyboard_belgian.webp)
