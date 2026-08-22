---
slug: direnv
title: "direnv — Stop Typing `source .env`, Let Your Shell Do It"
description: "direnv automatically loads and unloads environment variables when you cd into a project. Different database passwords per project, no manual source commands, and nothing ever leaks into your global shell."
authors: [christophe, claude]
image: /img/v2/direnv.webp
mainTag: linux
draft: true
tags: [bash, docker, linux, zsh]
date: 2026-08-11
ai_assisted: true
---

![direnv — Stop Typing source .env, Let Your Shell Do It](/img/v2/direnv.webp)

<TLDR>
`direnv` hooks into your shell and automatically runs `source .env` (or any command in an `.envrc` file) when you `cd` into a project — and undoes it when you leave. Each project gets its own environment variables with no global pollution, no manual sourcing, and no risk of carrying one project's secrets into another.
</TLDR>

Every Docker project has a `.env` file. And every time you open a new terminal and forget to run `source .env`, something fails. You set `DB_PASSWORD` in the shell, switch to another project, and now your second project's Docker Compose is picking up the wrong database credentials.

`direnv` solves this permanently. You `cd` in — variables are loaded. You `cd` out — they're gone.

<!-- truncate -->

## Seeing direnv in Action

Create a project directory and add an `.envrc` file:

<Terminal>
mkdir my-api && cd my-api
echo "dotenv" > .envrc
</Terminal>

The single word `dotenv` tells direnv to load the `.env` file in the same directory. Now create the `.env`:

<Terminal>
cp .env.example .env
# edit .env with your local values
</Terminal>

The first time you enter a directory with a new `.envrc`, direnv asks for explicit permission:

<Terminal>
direnv: error /home/christophe/my-api/.envrc is blocked. Run `direnv allow` to approve its content.
</Terminal>

Run it once:

<Terminal>
direnv allow
</Terminal>

From that point on, entering the directory loads the variables automatically:

<Terminal>
cd my-api
direnv: loading ~/my-api/.envrc
direnv: export +APP_DEBUG +APP_PORT +DB_HOST +DB_NAME +DB_PASSWORD +DB_PORT +DB_USER
</Terminal>

And leaving unloads them:

<Terminal>
cd ..
direnv: unloading
</Terminal>

<AlertBox type="info" title="The allow step is intentional">
direnv requires explicit approval (`direnv allow`) each time `.envrc` changes. This prevents a cloned repository from automatically running arbitrary code in your shell without your knowledge.
</AlertBox>

That's the entire effect — the install behind it is two commands, covered next.

## Seeing It in Action with Docker

Before hooking direnv into your own `~/.bashrc`, try the exact flow above in a throwaway
container — the `my-api` project (`.envrc`, `.env`, `compose.yaml`) is already built, deliberately
left un-allowed so the "blocked" message is the first thing you see.

<AlertBox variant="tip" title="Why Docker first?">
The Dockerfile below installs direnv, hooks it into bash, and builds the `my-api` project from the
"Docker Compose use case" section further down. Nothing on your own machine changes.
</AlertBox>

<Snippet
  filename="Dockerfile"
  source="./files/Dockerfile"
  defaultOpen={false}
/>

Build and run it:

<Terminal title="user@machine: ~/direnv-demo">
$ docker build -t direnv-demo .
[+] Building 11.4s (6/6) FINISHED
 ✔ exporting to image

$ docker run --rm -it direnv-demo
🐳 root ~ # cd my-api
direnv: error /root/my-api/.envrc is blocked. Run `direnv allow` to approve its content
</Terminal>

Exactly the "blocked" message from above. Approve it, then leave and come back:

<Terminal title="🐳 root ~/my-api #">
$ direnv allow
direnv: loading ~/my-api/.envrc
direnv: export +APP_DEBUG +APP_PORT +DB_HOST +DB_NAME +DB_PASSWORD +DB_PORT +DB_USER

$ cd ..
direnv: unloading

$ cd my-api
direnv: loading ~/my-api/.envrc
direnv: export +APP_DEBUG +APP_PORT +DB_HOST +DB_NAME +DB_PASSWORD +DB_PORT +DB_USER
</Terminal>

Loaded on the way in, unloaded on the way out, reloaded the moment you're back — the whole pitch
of this article, live, before touching your own shell config.

## Why It Works

- direnv hooks your shell so every `cd` re-checks the current and parent directories for an `.envrc` file and re-evaluates it — no polling, no background daemon.
- The minimal `.envrc` is a single word, `dotenv` — there's nothing to write from scratch for the common case.
- `PATH_add` is a direnv built-in that prepends a path to `$PATH` and removes it again on exit. It's safer than `export PATH="./scripts:$PATH"` because direnv tracks exactly what it added, and can undo it cleanly.

## Install

On Ubuntu / Debian / WSL:

<Terminal>
sudo apt install direnv
</Terminal>

Then hook it into your shell. This is a one-time setup:

<Terminal>
# For ZSH (add to ~/.zshrc)
echo 'eval "$(direnv hook zsh)"' >> ~/.zshrc
source ~/.zshrc

# For Bash (add to ~/.bashrc)

echo 'eval "$(direnv hook bash)"' >> ~/.bashrc
source ~/.bashrc
</Terminal>

That's the entire installation. `direnv` is now watching every directory change.

## What goes in .envrc

The minimal `.envrc` is just `dotenv`:

<Snippet source="./files/.envrc" language="bash" />

But `.envrc` is a shell script. You can do more, including `PATH_add`:

<Snippet source="./files/.envrc-full" language="bash" />

## More Demos

### The Docker Compose use case

A typical project structure:

```
my-api/
  .env          ← actual secrets, git-ignored
  .env.example  ← template committed to git
  .envrc        ← just "dotenv", can be committed
  compose.yaml
```

<Snippet source="./files/.env.example" language="bash" />

Your `compose.yaml` references variables with `${DB_PASSWORD}` — Docker Compose reads from the environment, which direnv has already loaded:

```yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
```

When you `cd` into the project, `docker compose up` just works. When you switch projects, the old variables are gone and the new project's variables take their place.

### Multiple environments

Direnv works perfectly with multiple `.env` files. A common pattern:

```
.env           ← local dev (git-ignored)
.env.staging   ← staging values (may be committed if non-sensitive)
.env.example   ← template (always committed)
```

To temporarily switch environment without changing `.envrc`:

<Terminal>
DIRENV_LOG_FORMAT="" dotenv_if_exists .env.staging direnv exec . docker compose up
</Terminal>

Or simpler — adjust `.envrc` directly and re-allow:

```bash
# .envrc
dotenv .env.staging
```

## Under the Hood (skip this if you just want to use it)

### What to commit

The safe pattern:

```
.gitignore entries:
  .env
  .env.local
  .env.*.local

Committed:
  .envrc        ← safe, only contains "dotenv" or non-secret logic
  .env.example  ← documents all required variables, no real values
```

<AlertBox type="warning" title="Never commit .env with real secrets">
`.envrc` itself is safe to commit if it only contains `dotenv` or `PATH_add` calls. But `.env` with actual passwords or API keys must stay in `.gitignore`. Always.
</AlertBox>

### direnv and VSCode

VSCode's integrated terminal inherits the shell environment. If you open VSCode from a terminal where direnv has already loaded the variables for a project, they're available in the integrated terminal automatically.

If you launch VSCode directly (from the Dock, Spotlight, or a desktop shortcut), the integrated terminal starts fresh without your shell hooks. The fix: always open projects with `code .` from a terminal where direnv is active.

### Comparison with the manual approach

You may already use a pattern like the one described in <Link to="/blog/bash-load-env">Bash — Loading environment variables from a file</Link>. The difference:

| | Manual `source .env` | direnv |
| -- | --------------------- | -------- |
| Loads on `cd` | No | Yes |
| Unloads on `cd` out | No | Yes |
| Prevents env leakage | No | Yes |
| Works in all terminals | Needs re-sourcing | Yes |
| Supports `PATH_add` | No | Yes |

The manual approach is fine for a single-project workflow. Once you work across multiple projects in the same terminal session, direnv becomes indispensable.

## Conclusion

`direnv` is one of those tools that feels obvious the moment you use it. You stop thinking about environment setup and start focusing on the actual work. Each project carries its own context, and switching between them is frictionless.

Set it up once, add `dotenv` to `.envrc`, and never type `source .env` again.

:::tip Already using ZSH?
If you followed the <Link to="/blog/zsh-install">Oh-My-ZSH setup</Link> on this blog, direnv integrates directly into your `.zshrc` with the single `eval "$(direnv hook zsh)"` line shown above.
:::
