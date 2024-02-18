---
slug: winscp-search-for-text
title: WinSCP - Search for Text
authors: [christophe]
image: /img/winscp_tips_social_media.jpg
tags: [tips, winscp]
enableComments: true
draft: true
---
![WinSCP - Search for Text](/img/winscp_tips_banner.jpg)

It is possible to launch a search to, for example, find the string `Notes management` in all the `.php` files of the remote site.

To do this, go to the `Commands` menu, then `Static custom` commands and finally `Search for Text...`

<!-- truncate -->

![Search for Text](./images/search_for_text.png)

By searching for `Notes management`, [WinSCP](https://winscp.net/) will inform me that this pattern has been retrieved in file `/public_html/git/markdown/index.php`.

![Result](./images/result.png)

:::tip
It is, in fact, the execution of a script (an extension in the WinSCP language) which is here : `C:\Program Files (x86)\WinSCP\Extensions\SearchText.WinSCPextension.ps1`
:::

## PHP-grep

Look at my [php_grep](https://github.com/cavo789/php_grep) PHP script. This script will allow you to scan files of your website and search for a specific pattern; f.i. a word or a sentence.

![PHP grep in action](./images/php_grep.gif)
