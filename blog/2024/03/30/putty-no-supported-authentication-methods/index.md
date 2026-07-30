---
slug: putty-no-supported-authentication-methods
title: Fatal error was starting Putty after having saved settings
date: 2024-03-30
description: Fix the frustrating PuTTY 'No supported authentication methods available' fatal error after saving settings. Learn the quick solution by deleting a specific PuTTY registry entry.
authors: [christophe]
image: /img/v2/putty.webp
mainTag: winscp
tags:
  - ssh
  - winscp
language: en
review_date: 2026-07-30
---
![Fatal error was starting Putty after having saved settings](/img/v2/putty.webp)

<TLDR>
This article fixes PuTTY's "No supported authentication methods available" fatal error that can appear after saving default settings: delete the `Default%20Settings` entry under `HKEY_CURRENT_USER\SOFTWARE\SimonTatham\PuTTY\Sessions` in the Windows registry to reset PuTTY's defaults.
</TLDR>

A few days ago, I updated my Putty configuration to set the default font-size to 12; no more 10.

Today, when starting Putty — whichever server I wanted to connect to — I got the *No supported authentication methods available* error, followed, in my case, by *(server sent: publickey, gssapi-keyex, gssapi-with-mic, keyboard-interactive)*.

I only understood the origin of the problem by looking at the window caption: Putty was trying to connect to a server other than the one I wanted. Why? And, ah, ok, the last time I modified my settings I was working on that server so, the solution should come from: *how can I reset my Putty settings?*

<!-- truncate -->

The solution has been provided by @makurison on [https://stackoverflow.com/questions/57072011/delete-putty-default-settings-modification-to-original](https://stackoverflow.com/questions/57072011/delete-putty-default-settings-modification-to-original).

Simply start `regedit.exe`, search for the key `Computer\HKEY_CURRENT_USER\SOFTWARE\SimonTatham\PuTTY\Sessions` and, there, remove the entry called `Default%20Settings`.

*While you're at it: <Link to="/blog/keepass-overriding-url">KeePass - Overriding the URL field</Link> shows how to launch a PuTTY session straight from a KeePass entry, credentials included — and <Link to="/blog/windows-terminal-ssh-profile">Windows Terminal - Adding a SSH profile</Link> does the same without PuTTY at all.*

<AlertBox variant="tip" title="Tired of session/password hassles with Putty?">
If you're also fighting with a forgotten stored password, see <Link to="/blog/winscp-retrieve-password">WinSCP - Retrieve a stored password</Link>. Or better, switch to key-based authentication once and for all: <Link to="/blog/linux-ssh-scp">SSH - Launch a terminal on your session without having to authenticate yourself</Link>.
</AlertBox>
