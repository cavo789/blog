---
date: 2023-12-27
slug: wsl-powershell
title: Starting the default associated Windows program on WSL
authors: [christophe]
image: /img/v2/wsl.webp
description: Learn the simple command to open files like PDFs and HTML from your WSL Linux console using their default Windows application - powershell.exe.
mainTag: wsl
tags: [powershell, tips, wsl]
---
![Starting the default associated Windows program on WSL](/img/v2/wsl.webp)

Very often, I'm in my Linux console and I'd like to open a pdf file that I've just generated or, more simply, to open an html file. But how can I do this?

Without knowing the tip that is the subject of this article, at the moment I launch <Link to="/blog/wsl-windows-explorer">Windows Explorer</Link> from my console, I get then the well-known file explorer interface and there I double-click on the file I want to open and leave it to Windows, which knows which program to launch to open this or that extension.

In fact, it's much simpler...

<!-- truncate -->

The tip: start `powershell.exe` followed by the filename to open like `powershell.exe guide.pdf` or `powershell.exe index.html`.

<AlertBox variant="note" title="Not available in Bash">
`powershell.exe` only works in the console. You can't use it in a Bash script (`.sh`), it won't be recognized there.

</AlertBox>

<AlertBox variant="info" title="`xdg-open`">
You can also use `xdg-open` to start your default browser so `xdg-open index.html` will open the file in your Windows browser.

</AlertBox>

If you get the error below, you'll find a solution in the article <Link to="/blog/wsl-windows-explorer#wsl-localhost-is-not-accessible">Windows Explorer</Link>

<Terminal title="Powershell">
Start : This command cannot be run due to the error: The system cannot find the file specified.
At line:1 char:1
+ Start "readme.html"
+ ~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : InvalidOperation: (:) [Start-Process], InvalidOperationException
    + FullyQualifiedErrorId : InvalidOperationException,Microsoft.PowerShell.Commands.StartProcessCommand
</Terminal>
