---
slug: vscode-codesnap
title: CodeSnap addon for VSCode
date: 2024-04-19
description: Easily take beautiful, shareable screenshots of your code snippets right inside VS Code with the CodeSnap extension. A simple, step-by-step guide.
authors: [christophe]
image: /img/v2/vscode_tips.webp
mainTag: vscode
tags:
  - markdown
  - vscode
language: en
---
![CodeSnap addon for VSCode](/img/v2/vscode_tips.webp)

<TLDR>
This article introduces the CodeSnap VSCode extension, which generates a nicely styled screenshot of selected code directly from the editor: run the `CodeSnap` command, select the lines to capture in the live preview, then save the resulting image.
</TLDR>

The extension [CodeSnap](https://marketplace.visualstudio.com/items?itemName=adpyke.codesnap) will **take beautiful screenshots of your code in VS Code** without effort.

Open your file in VS Code, press <kbd>CTRL</kbd>-<kbd>SHIFT</kbd>-<kbd>P</kbd> and run `CodeSnap`. You just need to select lines now.

![CodeSnap partial example](./images/partial.webp)

<!-- truncate -->

As soon as you've called `CodeSnap`, a vertical preview window will appear.

In your source code, select one or more lines and CodeSnap will update the preview.

When you're done, just click on the `Polaroid` button just above the preview, save the image and it's done.

Below is an example of PHP source code:

![Sample example for CodeSnap](./images/codesnap.webp)
