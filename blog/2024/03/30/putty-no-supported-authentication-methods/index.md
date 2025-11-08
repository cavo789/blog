---
slug: putty-no-supported-authentication-methods
title: Fatal error was starting Putty after having saved settings
date: 2024-03-30
description: Fix the frustrating PuTTY 'No supported authentication methods available' fatal error after saving settings. Learn the quick solution by deleting a specific PuTTY registry entry.
authors: [christophe]
image: /img/v2/putty.webp
mainTag: putty
tags: [putty, ssh]
language: en
---
![Fatal error was starting Putty after having saved settings](/img/v2/putty.webp)

A few days ago, I've updated my Putty configuration to set the default font-size to 12; no more 10.

Today, by starting Putty, whatever on which server I wish to join, I got the *No supported authentication methods available* followed by, in my case *(server sent: publickey, gssapi-keyex, gssapi-with-mic, keyboard-interactive)* fatal error.

I've only understand the origin of the problem by looking at the window caption: Putty tries to connect to a server other than the one I want. Why? And, ah, ok, last time I've modified my settings I was working on that server so, the solution should come from: *how can I reset my Putty settings?*

<!-- truncate -->

The solution has been provided by @makurison on [https://stackoverflow.com/questions/57072011/delete-putty-default-settings-modification-to-original](https://stackoverflow.com/questions/57072011/delete-putty-default-settings-modification-to-original).

Simply start `regedit.exe`, search for the key `Computer\HKEY_CURRENT_USER\SOFTWARE\SimonTatham\PuTTY\Sessions` and, there, remove the entry called `default/20session`.
