---
slug: devcontainer-tips
title: "Devcontainer - 19 Tips to Improve Your Daily Workflow"
description: "Nineteen devcontainer tips I use every day: stable names, per-user volumes, cached extensions, your own Git identity and VS Code profile, the right lifecycle hook, prebuilt images and the devcontainer CLI."
authors: [christophe]
image: /img/v2/devcontainer.webp
mainTag: devcontainer
draft: true
tags: [devcontainer, docker, vscode]
date: 2026-11-12
ai_assisted: true
---

![Devcontainer - 19 Tips to Improve Your Daily Workflow](/img/v2/devcontainer.webp)

<!-- AUTHOR-CHECK(run): aucune des 19 astuces n'a été rejouée. Faire un « Rebuild Container » avec files/devcontainer.json + files/post-create.sh et vérifier chaque point, en priorité : 4 (owner du volume), 7 (remoteEnv visible dans postCreateCommand, y compris sous Remote SSH), 9 (profil réappliqué après rebuild, dev.containers.defaultExtensions lu depuis un profil non-Default), 14 (init + shutdownAction), 17 (commande qui génère devcontainer-lock.json), 18 (build --push puis "image:"), 19 (la commande « Dev Containers: Install devcontainer CLI » existe sous WSL, et où elle pose le binaire). files/terminal_cli.txt est illustratif : le remplacer par une vraie sortie. -->
<!-- AUTHOR-CHECK(decision): date de publication à choisir (2026-11-12 est un placeholder). -->

<TLDR>
A devcontainer is a workstation described in a file, and most people only use a fraction of that file. Nineteen tips, grouped by what they give you: containers and volumes you can find, state that survives a rebuild, your identity and taste without imposing them on the team, hooks that don't slow down every reopening, and an environment built once and shared by everyone — CI included.
</TLDR>

I work in devcontainers every single day, and yet I only discovered a few days ago that two lines of `runArgs` give my container a real name instead of `serene_ganguly` — see <Link to="/blog/devcontainer-container-name">Devcontainer - Name Your Container and Group It in Docker Desktop</Link>. If I missed that one for years, I surely missed others.

So here they are: the tips that make the biggest difference in my daily workflow.

<!-- truncate -->

## The Whole Thing in One File

Here is a `devcontainer.json` using most of the tips at once. Each comment refers to a tip below:

<Snippet filename=".devcontainer/devcontainer.json" source="./files/devcontainer.json" />

Rebuild the container (**Dev Containers: Rebuild Container**) and you get: a container named `blog-devcontainer` with its own group in Docker Desktop, Docker and `gh` available without a single `apt-get` line, files owned by you on the host, a shell history and extensions that survive the rebuild, commits under your own name, `node_modules` installed and the browser opening on port 3000.

The one-time setup lives in a small script, called by `postCreateCommand`:

<Snippet filename=".devcontainer/scripts/post-create.sh" source="./files/post-create.sh" defaultOpen={false} />

## Name Things So You Can Find Them

### 1. Give your container a stable name

`runArgs` passes any flag to `docker run`. `--name` gives the container a name that never changes, so a script can target it: in a folder called `blog`, `docker exec -it blog-devcontainer bash` works on every rebuild. The `com.docker.compose.project` label groups the container in Docker Desktop.

Both are built from `${localWorkspaceFolderBasename}`, and both end with `-devcontainer`: on a real project, the `blog` group holds the containers that run services (a database, a reverse proxy, ...), `blog-devcontainer` holds the environments you code in, and stopping one never stops the other. Full story in <Link to="/blog/devcontainer-container-name">Devcontainer - Name Your Container and Group It in Docker Desktop</Link>.

### 2. Name volumes after the project and the user

A named volume is shared by every container on the Docker host that mounts it. On your laptop, that's harmless. On a shared server reached with <Link to="/blog/vscode-remote-ssh">VS Code Remote SSH</Link>, it is not: two colleagues opening the same project mount the same volume, and each one's shell history lands in the other's.

Build every volume name from the project and the user:

```json title=".devcontainer/devcontainer.json"
"mounts": [
  "source=${localWorkspaceFolderBasename}-${localEnv:USER}${localEnv:USERNAME}-history,target=/commandhistory,type=volume"
]
```

`${localWorkspaceFolderBasename}` is the project folder (`blog`), `${localEnv:USER}` the account that runs Docker (`christophe`): the volume becomes `blog-christophe-history`. Under Remote SSH, *local* means the remote server, so it is your account on that server — one volume per person, per project, with no configuration on anyone's side.

`USER` exists on Linux and macOS, `USERNAME` on Windows; the other one is empty, so writing both gives the right name on every host.

`docker volume ls --filter name=-christophe-` then lists everything that belongs to you.

## Survive a Rebuild

### 3. Keep your shell history

A rebuild throws away everything that is not in the image, including your `~/.bash_history`. Mount a named volume (tip 2) on `/commandhistory` and make bash write into it:

<Snippet filename=".devcontainer/Dockerfile" source="./files/Dockerfile.history" />

`history -a` appends each command as soon as it runs, so even a crashed terminal loses nothing. The same trick works for any cache you don't want to download again (`~/.cache/pip`, `~/.composer/cache`, ...). And if you want to go further, <Link to="/blog/atuin-bash-history">Atuin</Link> makes that history searchable.

### 4. Cache the VS Code extensions

At every rebuild, VS Code downloads and installs again every extension of the container — a long minute on a project with a dozen of them. They live in `~/.vscode-server/extensions`: put that folder on a named volume and the next rebuild finds them already there.

```json title=".devcontainer/devcontainer.json"
"mounts": [
  "source=${localWorkspaceFolderBasename}-${localEnv:USER}${localEnv:USERNAME}-vscode-extensions,target=/home/node/.vscode-server/extensions,type=volume"
]
```

The user name matters even more here than for the history: without it, two colleagues on a shared host would write into the same folder, and inherit each other's personal extensions (tip 9).

A brand-new volume mounted on a folder that doesn't exist in the image is owned by `root`, and VS Code, running as `node`, cannot write in it. Create the folder in the image first: Docker then copies its owner into the empty volume.

<Snippet filename=".devcontainer/Dockerfile" source="./files/Dockerfile.extensions" />

To force a clean reinstall, delete the volume: `docker volume rm blog-christophe-vscode-extensions`. With VS Code Insiders, the folder is `~/.vscode-server-insiders/extensions`.

## Be Yourself in the Container

### 5. Match your UID with the host

Run the container as root and every file it creates on a bind-mounted folder belongs to root on your host: a `sudo chown` waiting to happen. Set `remoteUser` to a non-root user and keep `updateRemoteUserUID` to `true` (the default on Linux): VS Code changes that user's UID/GID to yours at startup.

### 6. Use your SSH keys without copying them

VS Code forwards your SSH agent into the container when one is running on the host: `ssh` and `git push` use your keys, and the private keys themselves never enter the container.

Keep it that way. Mounting the whole `~/.ssh` folder makes your private keys readable by every extension and every script running inside — and on a shared server, `${localEnv:HOME}/.ssh` is the server's folder, not yours. What the agent does not carry is your `~/.ssh/config` (aliases, `ProxyJump` hosts): mount that single file, read-only.

```json title=".devcontainer/devcontainer.json"
"mounts": [
  "source=${localEnv:HOME}/.ssh/config,target=/home/node/.ssh/config,type=bind,readonly"
]
```

<AlertBox variant="caution" title="The file must exist on the host">
When the source of a bind mount does not exist, Docker creates an empty **folder** with that name, and SSH then fails on a `config` that is a directory. Run `touch ~/.ssh/config` on the host once. And use `${localEnv:HOME}`, not `~`: the tilde is not expanded in `mounts`.
</AlertBox>

### 7. Commit as yourself

`git commit` in a fresh container answers *Please tell me who you are*, unless the container knows your name and email. VS Code usually takes care of it: when it creates the container, it copies your host `~/.gitconfig` into it (the `dev.containers.copyGitConfig` setting, enabled by default) and forwards your Git credential helper.

Two situations escape that copy: the `devcontainer` CLI (tip 19), and a Docker host that is not your machine (tip 2) — the copied `~/.gitconfig` is then the server's one. For those, export your identity once in the host's `~/.bashrc`:

```bash title="~/.bashrc (host)"
export GIT_AUTHOR_NAME="Christophe Avonture"
export GIT_AUTHOR_EMAIL="no-reply@gmail.com"
```

`remoteEnv` passes both values to the container as `HOST_GIT_NAME` and `HOST_GIT_EMAIL`, and `post-create.sh` turns them into `git config --global` — **only when they are not empty**. A colleague who never exported anything keeps the copied `~/.gitconfig`, untouched.

The same script runs `git config --replace-all safe.directory`, so Git trusts the workspace even when its files belong to another UID. `--replace-all` keeps a single line, however many times the script runs.

## A Comfortable Editor, Without Imposing It

### 8. Ship what the team needs

`customizations.vscode.extensions` installs extensions **inside** the container, and `customizations.vscode.settings` sets defaults for this project only. A newcomer clones the repository, reopens in container, and gets the same linter, formatter and format-on-save as the rest of the team — no "which extensions do I need?" page in the README. To list what you currently use, see <Link to="/blog/vscode-export-list-of-extensions">VSCode - Export the list of extensions</Link>.

The rule of thumb for what goes there: if removing it would break the project for someone, it belongs in `devcontainer.json`. Everything else belongs to tip 9.

### 9. Keep your personal taste in a VS Code profile

Your light theme, your font size or the extension that colors brackets the way you like are **your** taste, and your colleagues don't want them imposed by `devcontainer.json`. They belong in a VS Code profile: a named set of settings, extensions, keybindings and layout, stored on your machine.

1. Command palette, **Profiles: New Profile...**, name it `Devcontainer`.
2. In that profile, pick your theme, your font, your comfort extensions.
3. Open a project in its devcontainer, then **Profiles: Switch Profile...** → `Devcontainer`. VS Code remembers the choice for that workspace.

The result: a dark theme in WSL, a light one as soon as you are in a container — so you always know at a glance where your terminal runs — while your colleague, opening the very same project, gets their own setup.

Extensions that run on the UI side (themes, icon packs, keymaps) work right away. For the ones that must run **inside** the container, list them in the profile's user settings: they are installed in every container you open, and only in yours.

```json title="settings.json (User, Devcontainer profile)"
{
  "workbench.colorTheme": "Default Light Modern",
  "dev.containers.defaultExtensions": ["eamodio.gitlens", "usernamehw.errorlens"]
}
```

### 10. Bring your dotfiles everywhere

Your shell taste — aliases, prompt, `.inputrc` — also stays out of the project, in your **user** VS Code settings:

```json title="settings.json (User)"
{
  "dotfiles.repository": "your-github-account/dotfiles",
  "dotfiles.installCommand": "install.sh",
  "dotfiles.targetPath": "~/dotfiles"
}
```

At each container creation, VS Code clones the repository and runs `install.sh`, in every devcontainer you will ever open.

### 11. Open terminals in the editor area

The terminal panel at the bottom of the window steals height from your code, and two terminals side by side quickly become unreadable. One setting moves every new terminal into the editor area, as a regular tab you can split, drag next to a file or pin:

```json title="settings.json (User)"
{
  "terminal.integrated.defaultLocation": "editor"
}
```

Now **Terminal: Create New Terminal** (<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>`</kbd>, <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>ù</kbd> on an AZERTY keyboard) opens a tab next to your files. It is a personal preference, so it goes in your user settings — or in the profile of tip 9 — and applies everywhere, devcontainer or not.

## The Container's Lifecycle

### 12. Use the right lifecycle hook

Four hooks, four moments — putting a command in the wrong one is the usual reason a devcontainer is slow to open:

| Hook | Runs | Use it for |
| --- | --- | --- |
| `initializeCommand` | **on the host**, before the build | create a missing `.env`, check a prerequisite |
| `postCreateCommand` | once, after the container is created | `yarn install`, `composer install`, one-time `git config` |
| `postStartCommand` | every time the container starts | start a background service |
| `postAttachCommand` | every time VS Code attaches | a notification, a check that VS Code must show |

A `yarn install` in `postStartCommand` costs you seconds at every reopening; in `postCreateCommand`, only after a rebuild. As soon as a hook needs more than one command, move it to a script under `.devcontainer/scripts/`, like `post-create.sh` above: readable, versioned, and testable on its own.

`initializeCommand` runs in the host's shell: on a Windows host without WSL, that is `cmd.exe`, where `test -f` does not exist. Keep it to commands available everywhere, such as `docker`.

### 13. Name your ports and open the browser automatically

`forwardPorts` is well known; `portsAttributes` much less. Give each port a `label` (it shows up in the **Ports** panel instead of a bare number) and choose what happens on auto-forward: `openBrowser`, `notify`, `silent` or `ignore`. `ignore` is perfect for the internal ports of a database you never want to see in the list.

### 14. Let the container outlive the window, cleanly

Two keys, two everyday annoyances.

**`"init": true`** puts a tiny init process as PID 1 of the container. VS Code's default PID 1 does nothing but wait, so nobody collects the processes your tools leave behind. That is what you see when:

- you stop `yarn start` (or `php artisan serve`, `npm run watch`) with <kbd>Ctrl</kbd>+<kbd>C</kbd>, start it again and get *port 3000 is already in use*: a child process of the first run is still alive;
- `ps aux` in a container that has been running for a week lists dozens of `<defunct>` lines;
- **Rebuild Container** hangs ten seconds before doing anything: PID 1 ignores the stop signal, so Docker waits, then kills.

With `init`, orphans are reaped, signals are forwarded, and the container stops immediately.

**`"shutdownAction": "none"`** keeps the container running when you close the VS Code window (by default, closing the window stops it). Concretely:

- you launch a long job — a full build, a test suite, a database import, an AI agent working on a task — close VS Code at 6 PM, and find the result the next morning instead of a stopped container;
- `docker exec -it blog-devcontainer bash` (tip 1) works from any terminal, even without VS Code open;
- the dev server stays reachable, for instance from your phone on the local network;
- reopening the project is instant: no container start, no `postStartCommand`.

The price is a container that keeps using memory until you stop it. That is where tip 1 pays twice: every devcontainer sits in its `-devcontainer` group in Docker Desktop, one click to stop it.

### 15. Greet newcomers with a cheatsheet

A new colleague opens the project. Which commands exist? How do I start the server? Where is the database? Instead of a README section nobody reads, let the terminal answer: every new terminal prints a welcome message and the list of the project's commands.

<Terminal source="./files/terminal_welcome.txt" />

One Bash script, versioned with the project, defines the commands and prints the list. Each command carries a `# @cmd` comment, and the `welcome` function turns those comments into the cheatsheet — add a function with its comment and it shows up on its own:

<Snippet filename=".devcontainer/scripts/welcome.sh" source="./files/welcome.sh" defaultOpen={false} />

`post-create.sh` adds one `source` line to `~/.bashrc`, so the script is loaded in **every** terminal — which is why it does not belong in `postAttachCommand`, whose output only lands in VS Code's log. And because the script is sourced from the repository rather than copied in the image, a command pushed by a colleague is there at your next terminal, without any rebuild. This very blog works that way: its devcontainer greets me with more than twenty commands, grouped by category.

## Build Once, Share With the Team

### 16. Use features instead of `RUN apt-get`

A *feature* is a packaged, versioned installer: one line in `features` and the tool is there, already configured for the container user. The catalog at [containers.dev/features](https://containers.dev/features) covers Docker-outside-of-Docker, the GitHub CLI, Node, Python, PHP, AWS/Azure CLIs and much more. Your `Dockerfile` stays short and focused on what is truly specific to your project.

### 17. Pin your features with a lockfile

`ghcr.io/devcontainers/features/github-cli:1` means "the latest 1.x": a colleague who rebuilds next month may get a different version than yours. A `devcontainer-lock.json`, next to `devcontainer.json` and committed with it, records the exact version and digest of every feature:

```json title=".devcontainer/devcontainer-lock.json"
{
  "features": {
    "ghcr.io/devcontainers/features/github-cli:1": {
      "version": "1.0.14",
      "resolved": "ghcr.io/devcontainers/features/github-cli@sha256:…",
      "integrity": "sha256:…"
    }
  }
}
```

From then on, every rebuild — yours, your colleagues', the CI's — installs exactly those versions, and a change of version becomes a reviewable diff in a pull request. To move forward on purpose, run `devcontainer upgrade --workspace-folder .` (tip 19) and commit the new lockfile.

### 18. Build the image once, pull it everywhere

Every colleague rebuilding the same `Dockerfile` with the same features is the same few minutes spent again and again. Build it once, push it to a registry, and let everyone else pull it:

```bash
docker login ghcr.io
devcontainer build --workspace-folder . \
  --image-name ghcr.io/cavo789/blog-devcontainer:latest \
  --push
```

The image goes to the registry named in `--image-name`: `ghcr.io/…` for GitHub, `registry.gitlab.com/…` for GitLab, or your company registry. The features are baked in, along with their metadata, so colleagues replace the whole `build` block with a single line:

```json title=".devcontainer/devcontainer.json"
"image": "ghcr.io/cavo789/blog-devcontainer:latest"
```

"Rebuild Container" becomes a `docker pull`. In practice, a CI job runs that `devcontainer build --push` whenever `.devcontainer/` changes, so nobody builds it by hand.

### 19. Run the same container outside VS Code

The `devcontainer` CLI reads the very same `devcontainer.json`. The Dev Containers extension already ships it: run **Dev Containers: Install devcontainer CLI** from the command palette and VS Code puts a `devcontainer` command on your `PATH` — nothing else to install, no Node.js on your machine.

The exact environment you develop in can then run your build from a plain terminal:

<Terminal source="./files/terminal_cli.txt" />

"It works on my machine" becomes "it works in my container". `devcontainer up` honors `runArgs`, features and all the hooks above — and `devcontainer build` is the command behind tip 18. In a CI pipeline, where VS Code is absent, the CLI comes with the runner instead: the `devcontainers/ci` action on GitHub, or the npm package `@devcontainers/cli` in an image that already has Node.js.

## Conclusion

A devcontainer is not just "my project in Docker": it is a workstation described in one file. Name the containers and the volumes so you can find them, keep what a rebuild would throw away, bring your identity and your taste without imposing them, put each command in the right hook, and build the image once for the whole team. Start with tips 1 and 3 — two minutes, and you'll feel the difference at the next rebuild. If your project also ships a production image, <Link to="/blog/docker-prod-devcontainer">sharing one Dockerfile between production and the devcontainer</Link> is the natural next step.

## Appendix: Line Endings From a Windows Checkout

Not a devcontainer setting, but a devcontainer is where it shows up. A repository cloned on the Windows side (not in WSL) with `core.autocrlf=true` gets CRLF line endings; mounted in the Linux container, `post-create.sh` then fails with `/usr/bin/env: 'bash\r': No such file or directory`. One file at the root of the repository fixes it for everyone, whatever their Git settings:

```text title=".gitattributes"
* text=auto eol=lf
*.cmd text eol=crlf
*.bat text eol=crlf
*.ps1 text eol=crlf
```
