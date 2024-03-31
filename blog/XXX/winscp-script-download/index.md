---
slug: winscp-script-download
title: WinSCP - Download files with specific extension recursively
authors: [christophe]
image: /img/winscp_tips_social_media.jpg
tags: [tips, winscp]
enableComments: true
draft: true
---
![WinSCP - Download files with specific extension recursively](/img/winscp_tips_banner.jpg)

The [WinSCP](https://winscp.net/) FTP client allows you to run a script that makes possible automation.

As an example, we'll download any `.php` files from a host and just these files.

<!-- truncate -->

## The script

```text
option batch abort

option confirm off

lcd "c:\temp"

open ftp://USERNAME:PASSWORD@HOST_OR_IP/

cd /public_html

option transfer ascii

get -filemask:*.php *

close

exit
```

## How to use

1. Save the previous script as, f.i., `c:\temp\rget.txt`
2. Edit the script and make these changes:
   1. where files should be downloaded, local folder (line `lcd "c:\temp"`)
   2. in case of need, replace `ftp` by `sftp`
   3. `USERNAME`: the FTP username
   4. `PASSWORD`: the password associated to this account
   5. `HOST_OR_IP`: the FTP host name or his IP
   6. The remote folder from where the files should be downloaded (line `cd /public_html`)
   7. the file extension to download (if not `.php`) (line `get -filemask:*.php *`)
   8. save the script
3. Start a DOS session
4. Run `cd \temp`
5. Run `winscp.com` from there: type `"C:\Program Files (x86)\WinSCP\WinSCP.com" /script="c:\temp\rget.txt"`

If everything is correctly set up, WinSCP will start a session terminal and will start to download each `.php` files found under your remote folder (sub-folders included).
