---
slug: winscp-download-recursively-files
title: WinSCP - Download files with specific extension recursively
date: 2024-08-22
description: Learn how to use WinSCP's scripting feature to download files with a specific extension (like .php) recursively from your FTP/SFTP server. Includes a simple script example.
authors: [christophe]
image: /img/v2/winscp.webp
mainTag: winscp
tags: [tips, winscp]
language: en
---
![WinSCP - Download files with specific extension recursively](/img/v2/winscp.webp)

The [WinSCP](https://winscp.net/) FTP client support scripting as we can read on [https://winscp.net/eng/docs/guide_automation](https://winscp.net/eng/docs/guide_automation).

In a previous life, I was often faced with the need to download a certain type of file, e.g. connect to an FTP server and retrieve PHP files locally for analysis.

Since WinSCP allows automation, it's easy to write a little script to do just that.

As an example, we'll thus download any `.php` files from a host.

<!-- truncate -->

## The script

The script is pretty straightforward, if you can believe it:

<Snippet filename="C:\temp\download.txt" source="./files/C:\temp\download.txt" />

## How to use

1. Save the previous script as, f.i., `C:\temp\download.txt`
2. Edit the script and make these changes:
   1. Where files should be downloaded, local folder (line `lcd "c:\temp"`)
   2. In case of need, replace `ftp` by `sftp`
   3. `USERNAME`: the FTP username
   4. `PASSWORD`: the password associated to this account
   5. `HOST_OR_IP`: the FTP host name or his IP
   6. The remote folder from where the files should be downloaded (line `cd /public_html`)
   7. The file extension to download (if not `.php`) (line `get -filemask:*.php *`)
   8. Save the script
3. Start a DOS session
4. Run `cd c:\temp`
5. Run `winscp.com` from there: type `"C:\Program Files (x86)\WinSCP\WinSCP.com" /script="c:\temp\download.txt"`

If everything is correctly set up, WinSCP will start a session terminal and will start to download each `.php` files found under your remote folder (sub-folders included).
