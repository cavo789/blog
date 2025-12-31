---
slug: windows-terminal-splitted-panes
title: Windows Terminal - Splitted Panes
date: 2026-12-31
description: Learn how to split panes in Windows Terminal for efficient multitasking; shortcuts, configuration tips, and workflow examples.
authors: [christophe]
image: /img/v2/windows_terminal_splitted_panes.webp
mainTag: customization
tags: [console, customization, dos, windows-terminal, wsl]
draft: true
language: en
---

![Windows Terminal - Splitted Panes](/img/v2/windows_terminal_splitted_panes.webp)

In this article, we'll see how to create a new Windows Terminal profile with three (or more) splitted panes so you can monitor several consoles at the same time.

I often need this when working on a complex project where I have several projects to maintain. Instead of opening several Windows Terminal windows, I prefer to have everything in a single window with splitted panes.

<!-- truncate -->

## Open Windows Terminal Settings

To open the Windows Terminal settings, you can use the following methods:

1. Click on the `+` button to open a new tab, then select "Settings" from the dropdown menu or,
2. Press `Ctrl + ,` while in Windows Terminal or,
3. Right-click on the title bar and select "Settings" or
4. Use the command `wt -p` in PowerShell or CMD.

![Getting access to Windows Terminal Settings](./images/windows_terminal_access_to_settings.webp)

Look bottom left and click on the `Open JSON file` link to edit the `settings.json` file directly.

![Open JSON file link](./images/windows_terminal_open_json_file.webp)

## Create a new profile

Once in the `settings.json` file, you need to create a new profile. Locate the `profiles` section and add a new profile object in the `list` array.

Copy and paste the code below, and adapt it to your needs (profile name, icon, command line, etc.).

```json
{
    "name": "Project environment",
    "icon": "🐍",
    "commandline": "wt.exe nt -p \"Ubuntu 24.04\" wsl.exe -d Ubuntu-24.04 --cd /home/christophe/repositories/project_1 ; sp -H -p \"Ubuntu 24.04\" wsl.exe -d Ubuntu-24.04 --cd /home/christophe/repositories/project_2 ; sp -V -p \"Ubuntu 24.04\" wsl.exe -d Ubuntu-24.04 --cd /home/christophe/repositories/project_3",
    "hidden": false
},
```

This will create a new profile named `Project environment` with three splitted panes, each running a different WSL Ubuntu instance in a specific directory (project_1, project_2, project_3).

The first pane will be the main one, and the other two will be splitted horizontally and vertically.

Here the result:

![Three panes in Windows Terminal](./images/windows_terminal_three_splitted_panes.webp)

If you need four panes, you can add another `sp` command in the `commandline` property.

```json
{
    "name": "Project environment",
    "icon": "🐍",
    "commandline": "wt.exe nt -p \"Ubuntu 24.04\" wsl.exe -d Ubuntu-24.04 --cd /home/christophe/repositories/project_1 ; sp -H -p \"Ubuntu 24.04\" wsl.exe -d Ubuntu-24.04 --cd /home/christophe/repositories/project_2 ; sp -V -p \"Ubuntu 24.04\" wsl.exe -d Ubuntu-24.04 --cd /home/christophe/repositories/project_3 ; sp -V -p \"Ubuntu 24.04\" wsl.exe -d Ubuntu-24.04 --cd /home/christophe/repositories/project_4",
    "hidden": false
}
```

![Four panes in Windows Terminal](./images/windows_terminal_four_splitted_panes.webp)

Or if you want a layout with a screen divided by four; two on top and two at the bottom, you can use this command line:

```json
{
    "name": "Project environment",
    "icon": "🐍",
    "commandline": "wt.exe nt -p \"Ubuntu 24.04\" wsl.exe -d Ubuntu-24.04 --cd /home/christophe/repositories/project_1 ; sp -H -p \"Ubuntu 24.04\" wsl.exe -d Ubuntu-24.04 --cd /home/christophe/repositories/project_3 ; sp -V -p \"Ubuntu 24.04\" wsl.exe -d Ubuntu-24.04 --cd /home/christophe/repositories/project_4 ; mf up ; sp -V -p \"Ubuntu 24.04\" wsl.exe -d Ubuntu-24.04 --cd /home/christophe/repositories/project_2",
    "hidden": false
}
```

![Four panes in a grid Windows Terminal](./images/windows_terminal_four_splitted_panes_grid.webp)

If you prefer a vertical layout:

```json
 {
    "name": "Project environment",
    "icon": "🐍",
    "commandline": "wt.exe nt -p \"Ubuntu 24.04\" wsl.exe -d Ubuntu-24.04 --cd /home/christophe/repositories/project_1 ; sp -V -p \"Ubuntu 24.04\" wsl.exe -d Ubuntu-24.04 --cd /home/christophe/repositories/project_2 ; mf left ; sp -H -p \"Ubuntu 24.04\" wsl.exe -d Ubuntu-24.04 --cd /home/christophe/repositories/project_3 ; mf right ; sp -H -p \"Ubuntu 24.04\" wsl.exe -d Ubuntu-24.04 --cd /home/christophe/repositories/project_4",
    "hidden": false
},
```

![Vertical four panes in Windows Terminal](./images/windows_terminal_vertical_four_splitted_panes.webp)
