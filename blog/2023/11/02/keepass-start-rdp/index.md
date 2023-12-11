---
slug: keepass-overriding-url
title: KeePass - Overriding the URL field
authors: [christophe]
tags: [keepass, winscp, putty, rdp, tips]
image: ./images/social_media.jpg
enableComments: true
date: 2023-11-02T12:00
---
# KeePass - Overriding the URL field

![KeePass - Overriding the URL field](./images/header.jpg)

The `url` field can also be used to start a program and, thus, not only to contains a valid URL.

The official documentation is located here: [https://keepass.info/help/base/autourl.html](https://keepass.info/help/base/autourl.html).

<!-- truncate -->

## Start Putty from KeePass

If you don't have putty installed on your machine, download it from [https://www.putty.org/](https://www.putty.org/). You just need the `putty.exe` file.

Download it and save `putty.exe` in a directory present in your PATH.

To do this, even if you're not an administrator of your machine, just start a MS DOS console and run `echo %PATH%`. You'll then see the list of directories already present and take the one where you can copy a new file. Then copy putty.exe in that folder. So, from now, you can just run `putty.exe` from everywhere.

Update your KeePass entry and set the `URL` property to the following instruction: `cmd://putty.exe  -load "Default Settings" {S:host} -l {USERNAME} -pw {PASSWORD}`

:::important
Make sure you have fill in the `host` advanced property.
:::

## Start WinSCP from KeePass

> [https://winscp.net/eng/docs/integration_keepass](https://winscp.net/eng/docs/integration_keepass)

If you wish to open WinSCP and see files, you can achieve this by updating  your KeePass entry and set the `URL` property to the following instruction: `cmd://"{ENV_PROGRAMFILES_X86}\WinSCP\WinSCP.exe" sftp://{USERNAME}:{PASSWORD}@{S:ip}:{T-REPLACE-RX:/{S:port}/-1//}{S:path}`

:::important
Make sure you have fill in the `ip` advanced property. You can also set the `port` and `path` properties; but they are optional.
:::

## Start a RDP/TS connection from KeePass

> [https://keepass.info/help/base/autourl.html](https://keepass.info/help/base/autourl.html)

You can also start a remote desktop / terminal server connection from within KeePass.

The URL has to be set like this: `cmd://mstsc.exe /v:{S:host} /f`

:::important
Make sure you have fill in the `host` advanced property.
:::
