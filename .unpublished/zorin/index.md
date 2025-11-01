---
slug: zorin
title: Playing with Zorin
date: 2025-10-20
description: Installing Zorin on my old computer
authors: [christophe]
image: /img/v2/zorin_os.webp
mainTag: Linux
tags: [linux]
language: en
draft: true
blueskyRecordKey:
---
![Playing with Zorin](/img/v2/zorin_os.webp)

Like everyone else, I've an old computer and with Windows 10 support coming to an end, I saw so many blog posts or news articles about [Zorin 18](https://zorin.com/) that I became curious and wanted to try it out.

Zorin OS is a Linux distribution based on Ubuntu that targets users switching from Windows or macOS, with a desktop environment very similar to Windows.

<!-- truncate -->

Zorin can be [download](https://zorin.com/os/download/) for free (i.e. the Core edition or the `Education` one). If you want to support developpers or need additional features, you can download the Pro edition (less than 50€ incl. sales tax end of 2025).

You'll have to download a `.iso` file and a software called `balenaEtcher` in order to flash a USB drive. Everything is perfectly described on the [how to install Zorin OS page](https://help.zorin.com/docs/getting-started/install-zorin-os/).

Once my USB drive ready, I just put it in my old PC, start the PC, press <kbd>F12</kbd> in my case to enter in the BIOS and change the boot sequence: the PC has to start on the USB drive this time; not the hard disk.

Save and exit the BIOS and, indeed, the installation screen is now displayed. As mentioned in the how to guide, I've to select the `Try or Install Zorin OS` option and wait a few until Zorin is doing some checks.

The PC will reboot and you'll get the Zorin welcome screen. Select the language for your OS; your keyboard configuration, normal or minimal installation, ... and proceed the installation.

So far, it's no more difficult than using a Windows installer and not different too: we need to wait  until everything is installed.

Windows users will appreciate Zorin OS's graphical interface because very similar to Windows, with menus and taskbars, with a file manager.

![Zorin interface](./images/zorin_desktop.webp)

Zorin offers direct Microsoft OneDrive integration.

You'll also be able to install some Windows application directly on Zorin thanks `WINE` (*open-source compatibility layer that allows Windows applications and games to run on Linux.*).

The installer is well done, click, click, click and reboot.

The system was immediately operational i.e. no problem at all with my graphic card and my internet connection was operational.

Zorin comes with a lot of preinstalled software like Libre-Office

<AlertBox variant="info" title="Re-format USB flash drive">
Now that Zorin has been installed, you can reformat your USB drive to be able to reuse it.

Just read the [Re-format USB flash drive](https://help.zorin.com/docs/getting-started/reuse-your-zorin-os-usb-install-drive/) chapter in the official documentation.

</AlertBox>

To get more information about Zorin and his latest version: [Zorin OS 18 Has Arrived](https://blog.zorin.com/2025/10/14/zorin-os-18-has-arrived/).
