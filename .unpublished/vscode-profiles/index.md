---
slug: vscode-profiles
title: "VSCode Profiles: One Window, Two Completely Different Setups"
authors: [christophe, claude]
image: /img/v2/customization_prompt.webp
mainTag: vscode
tags: [vscode, customization]
date: 2026-12-31
description: "VSCode Profiles bundle extensions, theme, settings and keybindings into isolated, switchable sets. This article walks through my actual two-profile split: a dark daily driver and a light DevContainer profile that's also the only place Claude Code gets installed."
language: en
ai_assisted: true
draft: true
---

![VSCode Profiles: One Window, Two Completely Different Setups](/img/v2/customization_prompt.webp)

<!-- cspell:ignoreCase devcontainer -->

<TLDR>
VSCode **Profiles** bundle an entire setup — extensions, theme, settings, keybindings, even snippets — into a named, switchable unit. I run two: a dark daily-driver profile for everyday work, and a second one, named **DevContainer**, that forces a light theme and is the *only* place I have the Claude Code extension installed. This article documents that actual split, not a hypothetical one.
</TLDR>

Not every VSCode window I open is doing the same job. Some are "write a blog post, browse some Markdown, nothing fancy." Others are "I'm in a devcontainer, about to hand real work to an agent." Mixing both contexts into one identical setup means either the daily driver carries extensions it never needs, or the devcontainer setup is missing something it always needs — Profiles is the feature that lets each context carry exactly what it needs and nothing else.

<!-- truncate -->

## My Actual Split: Daily vs. DevContainer

<!-- TODO(author): capture a real side-by-side screenshot of the dark Default profile and the light DevContainer profile here before publishing — not reproducible in this session (requires a live VSCode GUI). -->

<AlertBox variant="info" title="Two profiles, two jobs">
**Default profile** — dark theme, the full extension set, used for everything day-to-day: writing this blog, general browsing of code, quick edits.
**DevContainer profile** — a forced **light** theme, and deliberately a narrower extension set built around actual devcontainer work.
</AlertBox>

The theme swap alone is a useful signal on its own: a glance at the color scheme tells me instantly which context a given window is in, before I've even looked at the folder name in the title bar — useful the moment more than one VSCode window is open on the taskbar at once.

### Claude Code Lives Only in DevContainer

The more deliberate part of the split: the **Claude Code** extension is installed in the DevContainer profile only — never in the default one. A profile boundary is an easy, enforced way to keep an agent scoped to the contexts meant for agent work, rather than it being present (and prompting, and available) in every single window regardless of what that window is actually for.

<AlertBox variant="tip" title="Extensions don't leak between profiles">
Installing an extension while a given profile is active only installs it *for that profile*. Switch to another profile and it's simply not there — not disabled, not hidden, genuinely absent from that profile's extension list. That's what makes the boundary reliable instead of just a convention you have to remember to respect.
</AlertBox>

## What a Profile Actually Isolates

A VSCode Profile bundles: installed extensions (and whether each is enabled), the color theme, `settings.json`, keybindings, and optionally UI layout and snippets. Switch profiles, and VSCode swaps all of it at once — not just a theme toggle, a genuinely different environment.

Open the **Profiles** menu from the gear icon (bottom-left) or the Command Palette (`Profiles: Switch Profile`) to see the list, or `Profiles: Create Profile` to start a new one — either empty, or cloned from your current setup.

## Switching, and Knowing Which One You're In

The active profile's name shows in the bottom-left corner next to the gear icon — worth glancing at once if a keybinding or an extension seems to be "missing," since it's usually not missing, just not part of the profile currently active.

Switching is a Command Palette action (`Profiles: Switch Profile`) or a click on that same gear-icon menu — fast enough to do per-window, not just once per session.

## Exporting a Profile

`Profiles: Export Profile` writes the whole bundle out as a `.code-profile` file (or a shareable link, if you're signed in to Settings Sync) — useful for recreating the exact same DevContainer setup on another machine without reconstructing the extension list from memory.

## Key Takeaways

<StepsCard
  variant="remember"
  title="VSCode Profiles quick reference"
  steps={[
    { content: "**A profile bundles extensions, theme, settings and keybindings** — switching one switches all of it, not just the color scheme" },
    { content: "**Theme-per-context is a cheap, effective visual signal** — dark for daily driver, light for DevContainer, readable at a glance" },
    { content: "**Extensions don't leak between profiles** — installing one while a profile is active scopes it to that profile alone" },
    { content: "**Use a profile boundary to scope an agent extension** — Claude Code lives in the DevContainer profile only, not the daily one" },
    { content: "**`Export Profile`** turns the whole setup into a portable `.code-profile` file for another machine" }
  ]}
/>

## Conclusion

The theme swap is the part that's immediately visible, but the actual value is the extension isolation underneath it — a hard boundary instead of a mental note to "remember not to use that extension here." Now, the moment a window looks light instead of dark, I already know what kind of work it's set up for, before reading a single file name.
