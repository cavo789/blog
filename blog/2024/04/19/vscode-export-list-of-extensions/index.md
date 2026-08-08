---
slug: vscode-export-list-of-extensions
title: Export the list of extensions you've installed in VSCode
date: 2024-04-19
description: Export and share your list of installed VS Code extensions using the `code --list-extensions` command. Learn how to generate direct installation commands for easy setup on a new machine using PowerShell or Linux.
authors: [christophe]
image: /img/v2/vscode_tips.webp
series: VSCode - Tips, extensions and shortcuts
mainTag: vscode
tags:
  - linux
  - vscode
language: en
review_date: 2026-07-30
---
![Export the list of extensions you've installed in VSCode](/img/v2/vscode_tips.webp)

<TLDR>
This article shows how to export the list of installed VSCode extensions with `code --list-extensions`, and turn that list into ready-to-run install commands using a PowerShell one-liner (`% { "code --install-extension $_" }`) or a Linux equivalent (`xargs -L 1 echo code --install-extension`) — handy for sharing your setup or provisioning a new machine.
</TLDR>

A small tip: by running `code --list-extensions` in a console (Linux or DOS), you'll get the list of all extensions you've installed in VSCode.

Now, just copy/paste that list and you can send it to a friend: *Hey, here are the extensions I use. Maybe one or the other will be useful to you.*

*A better way to share a setup with a whole team: put that list in a `devcontainer.json` so everyone gets the same extensions automatically; see <Link to="/blog/vscode-devcontainer">PHP development in a devcontainer with preinstalled code quality tools</Link>.*

<!-- truncate -->

The output of `code --list-extensions` will be something like this:

<!-- cspell:disable -->
<Terminal typewriter source="./files/terminal-2.txt" />
<!-- cspell:enable -->

If you're a PowerShell user, you can also run `code --list-extensions | % { "code --install-extension $_" }` and now the output will look like this:

<!-- cspell:disable -->
<Terminal typewriter source="./files/terminal-1.txt" />

<!-- cspell:enable -->

If you're a Linux user, the same thing can be obtained with `code --list-extensions | xargs -L 1 echo code --install-extension`

And that's nice: now by running these commands you can directly install these extensions.

If you're looking for a few worth adding to that list, I've written about <Link to="/blog/vscode-errorlens">Error Lens</Link>, which shows errors inline instead of hiding them in the Problems panel, and <Link to="/blog/vscode-todo-tree">Todo Tree</Link>, which collects every `TODO` and `FIXME` of your codebase in a single view.
