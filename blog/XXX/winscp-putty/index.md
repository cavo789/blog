---
slug: winscp-putty
title: WinSCP - Start PuTTY without typing a password
authors: [christophe]
image: /img/winscp_tips_social_media.jpg
tags: [putty, tips, winscp]
enableComments: true
draft: true
---
# WinSCP - Start PuTTY without typing a password

![WinSCP - Start PuTTY without typing a password](/img/winscp_tips_banner.jpg)

If you're a [WinSCP](https://winscp.net/) user, you may not yet know that you can start a remote SSH connection on your server (using [PuTTY](https://www.putty.org/)) without having to re-enter your credentials.

<!-- truncate -->

To do this, just go to the `Preferences` menu then go to `Integrations` then `Applications`. Be sure to check *Remember session password and pass it to PuTTY*.

![Settings](./images/settings.png)

Now by starting PuTTY, you won't be anymore prompted for credentials.

![Open in PuTTY](./images/WinSCP_Putty.png)
