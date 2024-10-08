---
slug: vscode-export-list-of-extensions
title: Export the list of extensions you've installed in VSCode
authors: [christophe]
image: /img/vscode_tips_social_media.jpg
tags: [tips, vscode]
enableComments: true
---
![Export the list of extensions you've installed in VSCode](/img/vscode_tips_banner.jpg)

A small tip: by running `code --list-extensions` in a console (Linux or DOS), you'll get the list of all extensions you've installed in VSCode.

Now, just copy/paste that list and you can send it to a friend *Hey, here are the extensions I use. Maybe one or the other will be useful to you.*.

<!-- truncate -->

The output of `code --list-extensions` will be something like this:

<!-- cspell:disable -->
```text
aaron-bond.better-comments
alefragnani.Bookmarks
bajdzis.vscode-twig-pack
bmewburn.vscode-intelephense-client
bobmagicii.autofoldyeah
calebporzio.better-phpunit
...
```
<!-- cspell:enable -->

If you've a PowerShell user, you can also run `code --list-extensions | % { "code --install-extension $_" }` and now the output will look like this:

<!-- cspell:disable -->
```text
code --install-extension aaron-bond.better-comments
code --install-extension alefragnani.Bookmarks
code --install-extension bajdzis.vscode-twig-pack
code --install-extension bmewburn.vscode-intelephense-client
code --install-extension bobmagicii.autofoldyeah
code --install-extension calebporzio.better-phpunit
...
```
<!-- cspell:enable -->

If you're a Linux user, the same thing can be obtained with `code --list-extensions | xargs -L 1 echo code --install-extension`

And that's nice: now by running these commands you can directly install these extensions.
