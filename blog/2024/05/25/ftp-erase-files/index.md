---
slug: ftp-erase-files
title: FTP - Remove files and folders at light speed
date: 2024-05-25
description: Stop the slow process of deleting files via FTP! Learn how to remove entire websites and folders at lightning speed using a simple, self-deleting PHP script—even without SSH access.
authors: [christophe]
image: /img/v2/winscp.webp
mainTag: linux
tags: [ftp, tips]
language: en
---
<!-- cspell:ignore subfolders -->
![FTP - Remove files and folders at light speed](/img/v2/winscp.webp)

Have you ever deleted a website from your FTP client? It's easy, just select the folder containing the website and press the <kbd>delete</kbd> key.

Easy, simple and ... so slow. It takes ages to suppress files / folders. Several dozen minutes! Ouch.

If you've a SSH connection to your web server and if you're comfortable with it; you can `rm -rf` the folder and it'll be done in seconds.

But what if you don't have SSH or fear to make errors?

There is an alternative, the `erase.php` script.

<!-- truncate -->

Open your FTP client, open your website folder (like `/var/www/html/old_site`); the one you wish to remove and create a new file called f.i. `erase.php` then copy/paste the code below in it.

<Snippet filename="erase.php" source="./files/erase.php" />

Start your browser, navigate to your website (`http://your_old_site.com`) and add `/erase.php` at the end to run the script.

<AlertBox variant="danger" title="Make sure this is what you want">
Be really sure this is what you want
</AlertBox>

<AlertBox variant="danger" title="Be extremely sure this is what you want">
The script will then start immediately and will remove everything without asking confirmation nor backup. Just killing files and folders.

At the end of the process (i.e. in just a few seconds), the folder will be completely empty.
</AlertBox>