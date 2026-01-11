---
slug: windows-terminal-split-panes
title: Windows Terminal - Split Panes
date: 2026-12-31
description: Learn how to split panes in Windows Terminal for efficient multitasking; shortcuts, configuration tips, and workflow examples.
authors: [christophe]
image: /img/v2/windows_terminal_splitted_panes.webp
mainTag: customization
tags: [console, customization, windows-terminal, wsl]
draft: true
language: en
---

![Windows Terminal - Split Panes](/img/v2/windows_terminal_splitted_panes.webp)

In this article, we'll show how to create a Windows Terminal profile with three (or more) split panes so you can monitor multiple consoles at the same time.

I often need this when working on a large project composed of several repositories: a backend application, a consumer application, a shared library, and a proof-of-concept that ties them together. Instead of opening four separate terminal windows, I prefer a single window with split panes.

This also lets me run the same command in all panes (for example, run tests), monitor logs, or push changes to Git — all from one window.

And when I need to focus on one pane, I can zoom in on it and hide the others temporarily.

<!-- truncate -->

We'll use Windows Terminal. It ships with Windows 10 and later and is the default terminal for Windows. If you don't have it, download it here: [Windows Terminal on Microsoft Store](https://www.microsoft.com/store/productId/9N0DX20HK701).

## Open Windows Terminal Settings

The first step is to open the Windows Terminal settings page. You can use one of these methods:

1. Click the `+` button to open a new tab, then select **Settings** from the dropdown menu.
2. Press `Ctrl + ,` in Windows Terminal.
3. Right-click the title bar and select **Settings**.
4. Run `wt -p` from PowerShell or CMD.

![Getting access to Windows Terminal Settings](./images/windows_terminal_access_to_settings.webp)

Look at the **bottom-left** and click **Open JSON file**. This opens an editor (for example, VS Code) with the `settings.json` file.

![Open JSON file link](./images/windows_terminal_open_json_file.webp)

## Create a new profile manually

Inside `settings.json`, add a new profile object to the `profiles.list` array.

Copy and paste the code below as a new entry in the `list` array and adapt it to your needs (profile name, icon, command line, etc.).

```json
{
    "name": "My complex project",
    "icon": "🐍",
    "commandline": "wt.exe nt -p \"Ubuntu 24.04\" wsl.exe -d Ubuntu-24.04 --cd ~/repositories/project_1 ; sp -H -p \"Ubuntu 24.04\" wsl.exe -d Ubuntu-24.04 --cd ~/repositories/project_2 ; sp -V -p \"Ubuntu 24.04\" wsl.exe -d Ubuntu-24.04 --cd ~/repositories/project_3",
    "hidden": false
},
```

This will create a new profile named `My complex project` with three split panes, each running a different WSL Ubuntu instance in a specific directory (project_1, project_2, project_3).

Go back to Windows Terminal and display the list of profiles and you'll see the newly created one. Click on it to start it.

<AlertBox variant="info" title="Due to the use of the `wt.exe nt` command, Windows Terminal will open a new window with the specified layout." />

The first pane will be the main one, and the other two will be split horizontally and vertically as illustrated below.

![Three panes in Windows Terminal](./images/windows_terminal_three_splitted_panes.webp)

If you need four panes, you can add another `sp` command in the `commandline` property.

```json
{
    "name": "My complex project",
    "icon": "🐍",
    "commandline": "wt.exe nt -p \"Ubuntu 24.04\" wsl.exe -d Ubuntu-24.04 --cd ~/repositories/project_1 ; sp -H -p \"Ubuntu 24.04\" wsl.exe -d Ubuntu-24.04 --cd ~/repositories/project_2 ; sp -V -p \"Ubuntu 24.04\" wsl.exe -d Ubuntu-24.04 --cd ~/repositories/project_3 ; sp -V -p \"Ubuntu 24.04\" wsl.exe -d Ubuntu-24.04 --cd ~/repositories/project_4",
    "hidden": false
}
```

![Four panes in Windows Terminal](./images/windows_terminal_four_splitted_panes.webp)

Or if you want a layout with a screen divided by four; two on top and two at the bottom, you can use this command line:

```json
{
    "name": "My complex project",
    "icon": "🐍",
    "commandline": "wt.exe nt -p \"Ubuntu 24.04\" wsl.exe -d Ubuntu-24.04 --cd ~/repositories/project_1 ; sp -H -p \"Ubuntu 24.04\" wsl.exe -d Ubuntu-24.04 --cd ~/repositories/project_3 ; sp -V -p \"Ubuntu 24.04\" wsl.exe -d Ubuntu-24.04 --cd ~/repositories/project_4 ; mf up ; sp -V -p \"Ubuntu 24.04\" wsl.exe -d Ubuntu-24.04 --cd ~/repositories/project_2",
    "hidden": false
}
```

![Four panes in a grid Windows Terminal](./images/windows_terminal_four_splitted_panes_grid.webp)

If you prefer a vertical layout:

```json
 {
    "name": "My complex project",
    "icon": "🐍",
    "commandline": "wt.exe nt -p \"Ubuntu 24.04\" wsl.exe -d Ubuntu-24.04 --cd ~/repositories/project_1 ; sp -V -p \"Ubuntu 24.04\" wsl.exe -d Ubuntu-24.04 --cd ~/repositories/project_2 ; mf left ; sp -H -p \"Ubuntu 24.04\" wsl.exe -d Ubuntu-24.04 --cd ~/repositories/project_3 ; mf right ; sp -H -p \"Ubuntu 24.04\" wsl.exe -d Ubuntu-24.04 --cd ~/repositories/project_4",
    "hidden": false
},
```

![Vertical four panes in Windows Terminal](./images/windows_terminal_vertical_four_splitted_panes.webp)

There are many ways to create layouts—see the full `wt` command reference here: [Windows Terminal Command Line Arguments](https://learn.microsoft.com/en-us/windows/terminal/command-line-arguments?tabs=windows).

## Bonus

### Toggle zoom for a pane

This one is my favorite. You can zoom in and out of a pane by pressing <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd> then selecting **Toggle zoom for pane**. Repeat the shortcut to restore the view.

This is very useful when you want to focus on a specific pane without closing the others.

### Keyboard shortcuts to manage panes

Here is a list of useful keyboard shortcuts to manage panes in Windows Terminal:

<AlertBox variant="note" title="`+` and `-` refer to the keys on the main keyboard, not the numeric keypad." />

* <kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>+</kbd> : Split the current pane vertically.
* <kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>-</kbd> : Split the current pane horizontally.
* <kbd>Alt</kbd> + <kbd>Shift</kbd> and play with arrow keys : Increase or decrease the size of the current pane in the direction of the arrow key pressed.

Press <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>W</kbd> to close the current pane.

### Control panel actions

You can broadcast input to all panes by toggling the **Toggle broadcast input to all panes** option from the **Control Panel** menu (the one you get by pressing <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd>).

So, toggle this option, and you'll see the cursor change to indicate that broadcasting is active. Now, whatever you type in one pane will be sent to all panes.

![Broadcast input to all panes](./images/panes_broadcasting.gif)

Toggle the option again to disable broadcasting.

Use cases: you can clear the screen in all panes at once by typing `clear` or, like in my use case, I can push my changes to Git in all repositories by typing something like `git add . && git commit -m 'wip' && git push` once.
