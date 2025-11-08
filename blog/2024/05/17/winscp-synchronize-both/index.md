---
slug: winscp-synchronize-both
title: WinSCP - Synchronize host and remote
date: 2024-05-17
description: Use a script with WinSCP to easily synchronize files between your local host and a remote FTP/SFTP server. Learn the commands for local, remote, or bi-directional synchronization.
authors: [christophe]
image: /img/v2/winscp.webp
mainTag: winscp
tags: [dos, synology, tips, winscp]
language: en
---
![WinSCP - Synchronize host and remote](/img/v2/winscp.webp)

By the use of a script, it's possible to ask [WinSCP](https://winscp.net/) to synchronize your host and remote machine i.e. if a file is newer on the host, copy it to your remote server and the opposite.

If a file has been added to your host, copy it to your remote server and vice versa.

I'm using such script for making a full backup of some of my folders to my Synology.

<!-- truncate -->

## The script

<Snippet filename="c:\temp\synchronize.txt" source="./files/c:\temp\synchronize.txt" />

## How to use

1. Save the previous script as, f.i., `c:\temp\synchronize.txt`
2. Edit the script and specify:
   1. in case of need, replace `ftp` by `sftp`
   2. `USERNAME`: the FTP username
   3. `PASSWORD`: the password associated to this account
   4. `HOST_OR_IP`: the FTP host name or his IP
   5. `PORT`: the port to use (21 for a FTP connection f.i.)
   6. The local folder where your files are stored (line `lcd "C:\Christophe"`)
   7. The remote folder from where the files should be copied (line `cd /Christophe`), can be the ftp root or any subfolder
3. Start a DOS session
4. Run `cd \temp`
5. Run `winscp.com` from there: type `"c:\program files (86)\WinSCP\WinSCP.com" /script="c:\temp\synchronize.txt"`

If everything is correctly set up, WinSCP will start a session terminal and will start the synchronization.

## More info

More info about the Synchronize verb of WinSCP: [https://winscp.net/eng/docs/scriptcommand_synchronize](https://winscp.net/eng/docs/scriptcommand_synchronize).

* If files/folders are already there, don't do anything.
* If there are new files/folders, copy them.
* If files/folders are no more on the local drive, remove them from the remote server.

So local is the master.

### Local / Remote / Both

See the line `synchronize remote`.

Choose `remote`, `local` or `both`:

* When the first parameter is `local`, changes from remote directories are applied to local directories.
* When the first parameter is `remote`, changes from the local directories are applied to the remote directories.
* When the first parameter is `both`, both local and remote directories can be modified ([source](https://winscp.net/eng/docs/scriptcommand_synchronize#remarks)).
