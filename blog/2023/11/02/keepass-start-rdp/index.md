---
slug: keepass-overriding-url
title: KeePass - Overriding the URL field
date: 2023-11-02
description: Learn how to override the KeePass URL field to launch programs like PuTTY, WinSCP, or a Remote Desktop connection (RDP) directly from your entries.
authors: [christophe]
image: /img/v2/keepass.webp
series: WinSCP & remote file transfer
mainTag: winscp
tags:
  - windows
  - winscp
language: en
review_date: 2026-07-30
---
![KeePass - Overriding the URL field](/img/v2/keepass.webp)

<TLDR>
This article shows how to repurpose the KeePass `URL` field to launch external programs instead of a web browser, using the `cmd://` prefix and entry placeholders: starting PuTTY with saved credentials, opening WinSCP directly to an SFTP path, or launching a Windows Remote Desktop (`mstsc.exe`) connection to a saved host.
</TLDR>

The `url` field can also be used to start a program and, thus, not only to contain a valid URL.

The official documentation is located here: [https://keepass.info/help/base/autourl.html](https://keepass.info/help/base/autourl.html).

<!-- truncate -->

## Start PuTTY from KeePass

If you don't have PuTTY installed on your machine, download it from [https://www.putty.org/](https://www.putty.org/). You just need the `putty.exe` file. *If PuTTY refuses your saved session with an authentication error, see <Link to="/blog/putty-no-supported-authentication-methods">Fatal error was starting Putty after having saved settings</Link>.*

Download it and save `putty.exe` in a directory present in your PATH.

To do this, even if you're not an administrator of your machine, just start a MS-DOS console and run `echo %PATH%`. You'll then see the list of directories already present and choose the one where you can copy a new file. Then copy `putty.exe` in that folder. So, from now on, you can just run `putty.exe` from anywhere.

Update your KeePass entry and set the `URL` property to the following instruction: `cmd://putty.exe  -load "Default Settings" {S:host} -l {USERNAME} -pw {PASSWORD}`

<AlertBox variant="caution">
Make sure you have filled in the `host` advanced property.

</AlertBox>

## Start WinSCP from KeePass

> [https://winscp.net/eng/docs/integration_keepass](https://winscp.net/eng/docs/integration_keepass)

If you wish to open WinSCP (see also <Link to="/blog/winscp-synchronize-both">WinSCP - Synchronize host and remote</Link>) and see files, you can achieve this by updating your KeePass entry and setting the `URL` property to the following instruction: `cmd://"{ENV_PROGRAMFILES_X86}\WinSCP\WinSCP.exe" sftp://{USERNAME}:{PASSWORD}@{S:ip}:{T-REPLACE-RX:/{S:port}/-1//}{S:path}`

<AlertBox variant="caution">
Make sure you have filled in the `ip` advanced property. You can also set the `port` and `path` properties; they are optional, however.

</AlertBox>

## Start an RDP/TS connection from KeePass

> [https://keepass.info/help/base/autourl.html](https://keepass.info/help/base/autourl.html)

You can also start a remote desktop / terminal server connection from within KeePass.

The URL has to be set like this: `cmd://mstsc.exe /v:{S:host} /f`

<AlertBox variant="caution">
Make sure you have filled in the `host` advanced property.

</AlertBox>
