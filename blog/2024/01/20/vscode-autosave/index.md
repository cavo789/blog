---
slug: vscode-autosave
title: Autosave feature in VSCode
date: 2024-01-20
description: Tired of forgetting to save files in VS Code? Learn how to easily enable the Autosave feature, set it to onFocusChange, and never lose unsaved changes again!
authors: [christophe]
image: /img/v2/vscode_tips.webp
mainTag: vscode
tags:
  - markdown
  - vscode
language: en
review_date: 2026-07-30
---
![Autosave feature in VSCode](/img/v2/vscode_tips.webp)

<TLDR>
This article shows how to enable VSCode's Autosave feature, either through the Settings UI (`Files: Auto save` set to `onFocusChange`) or by adding the corresponding line to `settings.json`, so changes are saved automatically whenever the editor loses focus instead of relying on manual `Ctrl+S`.
</TLDR>

How many times have you modified a file in VSCode (and forgotten to save the modification) in order to refresh it from your web page, run the script from your console, etc., and then thought *Oh no, damn, it still doesn't work*?

And it can take several minutes of back and forth before — damn it, silly me — you realize you didn't save your changes.

And even more so when you've done a Search & Replace in several files; some having been saved and others not — think of a <Link to="/blog/vscode-multiple-cursors">multiple cursors</Link> session spread across a dozen tabs.

Let's see how to avoid this.

<!-- truncate -->

It's really easy: press <kbd>CTRL</kbd>-<kbd>,</kbd> (comma) to show the settings page and start to type `autosave`.

The concerned settings will be displayed and set `Files: Auto save` on `onFocusChange`.

![Settings page](./images/autosave.webp)

Or, you can also simply add the following line in your `settings.json` file:

<Snippet filename="settings.json" source="./files/settings.json" />

<AlertBox variant="info" title="You're using a versioning system, right?">
Some people don't like this feature and say *I want to be aware when I save something* (in case I do something stupid eh) but, oh, there's a versioning system like Git isn't there? So if you do something stupid, just don't save the changes and/or do a `revert`.

If you're one of these people, try out the autosave function for a few days, and you'll see that it brings undeniable comfort.

</AlertBox>

Another setting in the same spirit, one you enable once and never think about again: <Link to="/blog/vscode-sticky-scroll">Sticky scroll in vscode</Link>.
