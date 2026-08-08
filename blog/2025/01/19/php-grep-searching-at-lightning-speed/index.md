---
slug: php-grep-searching-at-lightning-speed
title: Search your FTP server at lightning speed
date: 2025-01-19
description: Tired of painfully slow FTP search functions? Discover php_grep, the ultra-fast PHP script that uses regular expressions to find content on your FTP server at lightning speed.
authors: [christophe]
image: /img/v2/winscp.webp
series: WinSCP & remote file transfer
mainTag: winscp
tags:
  - code-quality
  - ssh
  - winscp
language: en
updates:
  - date: 2026-07-30
    note: "GitHub repo (cavo789/php_grep) archived May 2025; the PHP script still works when uploaded to your server."
---
![Search your FTP server at lightning speed](/img/v2/winscp.webp)

<TLDR>
Searching for text on an FTP server can be incredibly slow, especially with tools like WinSCP's built-in search. This article introduces `php_grep`, a lightweight and ultra-fast PHP script that revolutionizes FTP searching. By simply uploading this single file to your server and accessing it via a URL, you can perform lightning-fast, regular-expression-based searches for content within your files, and even filter results by file type.
</TLDR>

Did you know that using [WinSCP](https://winscp.net/), you can run a search on your FTP to find all the documents containing a given string? It's native in WinSCP; nothing more to install but...

*Other WinSCP tricks on this blog: <Link to="/blog/winscp-download-recursively-files">download files with a specific extension recursively</Link> and <Link to="/blog/winscp-synchronize-both">synchronize host and remote</Link>.*

However, it's insanely slow; let's see how we can do it better and almost instantaneous.

<!-- truncate -->

## WinSCP - Search for Text

Probably you never had noticed (it was my case), you can start searching files on your FTP server using WinSCP.

To do this, go to the `Commands` menu, then `Static custom` commands and finally `Search for Text...`.  Type your search pattern and press <kbd>Enter</kbd>.

![Search for Text](./images/search_for_text.webp)

A new Powershell prompt will be started and you'll see the list of scanned files.

![Result](./images/result.webp)

<AlertBox variant="info" title="It's a Powershell script">
WinSCP will, in fact, start a `.ps1` script located here: `C:\Program Files (x86)\WinSCP\Extensions\SearchText.WinSCPextension.ps1`. Feel free to update the file to match your needs.

</AlertBox>

It's terribly slow and you'll get a huge list with all your files; not only the ones where the search pattern is retrieved. This function has the merit of existing, but it's not much.

## php_grep

Time flies... In 2016, I developed an ultra-fast little script called [php_grep](https://github.com/cavo789/php_grep) that scans every file present and, using a small regular expression, finds the files containing the search pattern and displays its location if the search is successful.

You just need to download a copy of my script (a single PHP page), copy the script on your FTP server and access it using a URL. Really easy.

This done, you'll get an interface where you can type, for sure, the search expression but also restricts the search to f.i. `.html` files.

![php_grep in action](./images/php_grep.webp)

More info on [https://github.com/cavo789/php_grep](https://github.com/cavo789/php_grep)

*The trick here is to search **on the server**, so nothing has to travel over the wire. When the files are already on your own disk, the same "lightning speed" feeling is provided by <Link to="/blog/ripgrep">ripgrep</Link>.*
