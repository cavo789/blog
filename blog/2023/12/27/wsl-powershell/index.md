---
slug: wsl-powershell
title: Starting the default associated Windows program on WSL
date: 2023-12-27
description: Learn the simple command to open files like PDFs and HTML from your WSL Linux console using their default Windows application - powershell.exe.
authors: [christophe]
image: /img/v2/wsl.webp
series: WSL2 - Install, move and use it
mainTag: wsl
tags:
  - windows
  - wsl
language: en
review_date: 2026-07-30
---
![Starting the default associated Windows program on WSL](/img/v2/wsl.webp)

<TLDR>
This article shares a quick WSL trick: running `powershell.exe <filename>` (e.g. `powershell.exe guide.pdf`) from the Linux console opens that file with its default Windows application, without needing to browse to it in Windows Explorer first. `xdg-open` is mentioned as an alternative for opening the default browser.
</TLDR>

Very often, I'm in my Linux console and I'd like to open a pdf file that I've just generated or, more simply, to open an html file. But how can I do this?

Without knowing the tip that is the subject of this article, at the moment I launch <Link to="/blog/wsl-windows-explorer">Windows Explorer</Link> from my console, I then get the well-known file explorer interface and there I double-click on the file I want to open and leave it to Windows, which knows which program to launch to open this or that extension.

In fact, it's much simpler...

<!-- truncate -->

The tip: start `powershell.exe` followed by the filename to open like `powershell.exe guide.pdf` or `powershell.exe index.html`.

*A typical use case: you've just generated a PDF with <Link to="/blog/docker-quarto">Quarto in Docker</Link> and want to check the result without leaving your console.*

<AlertBox variant="note" title="Not available in Bash">
`powershell.exe` only works in the console. You can't use it in a Bash script (`.sh`), it won't be recognized there.

</AlertBox>

<AlertBox variant="info" title="`xdg-open`">
You can also use `xdg-open` to start your default browser so `xdg-open index.html` will open the file in your Windows browser.

</AlertBox>

If you get the error below, you'll find a solution in the article <Link to="/blog/wsl-windows-explorer#wsl-localhost-is-not-accessible">Windows Explorer</Link>

<Terminal typewriter title="Powershell" source="./files/terminal-1.txt" />
