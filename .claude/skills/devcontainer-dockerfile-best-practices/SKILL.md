---
name: devcontainer-dockerfile-best-practices
description: Generic, project-agnostic recipe for the Dockerfile that builds a devcontainer's development image — as opposed to the project's own production/runtime Dockerfile. Covers the language-agnostic backbone (user/UID-GID creation, sudo, shell history and rc-file setup for bash or zsh, timezone, "never COPY app code") plus a swappable per-stack tool-install block (Bash, Python (uv), PHP, Node, Go, ...). Pairs with the devcontainer-best-practices skill, which covers devcontainer.json itself.
disable-model-invocation: false
---

# DevContainer Dockerfile Best Practices

Covers only the Dockerfile referenced by `devcontainer.json`'s `build.dockerfile` — the image a
developer works *inside*. For the `devcontainer.json` side of the same setup (mounts, UID/GID
build args, volumes, postCreate/postStart hooks), see the sibling `devcontainer-best-practices`
skill; this one only covers what belongs in the image itself. For general Dockerfile structure that
applies regardless of which Dockerfile this is (multi-stage targets, BuildKit cache/secret mounts,
`ARG`-pinned versions, `HEALTHCHECK`, OCI labels), see the sibling `dockerfile-best-practices`
skill — read both when writing a devcontainer image from scratch.

## 1. First, know which Dockerfile you're editing

Most non-trivial repos end up with **two** Dockerfiles that look superficially similar (both
create a non-root user, both set `ARG USER_UID`/`USER_GID`) but serve opposite purposes. Confusing
them — e.g. adding `sudo` to a production image, or pinning a production base image loosely like a
dev one — is the most common mistake in this area.

| Aspect | DevContainer Dockerfile | Project / production Dockerfile |
| --- | --- | --- |
| Purpose | Interactive environment a human edits/lints/tests inside | What actually ships and runs (prod, CI, cron, ...) |
| Base image | Full-featured (`python:3.13-slim`, `debian`, `ubuntu`) — has a shell, apt, docs | Minimal (`alpine`, `distroless`, `scratch`) |
| Size / attack surface | Secondary concern — dev convenience wins | Primary concern — every MB and CVE matters |
| Application source | **Never `COPY`ed in** — bind-mounted live by the editor/host at runtime | `COPY`ed in (or built from) — baked into the image |
| `ENTRYPOINT`/`CMD` | None, or just a shell — a human attaches interactively | The actual application entrypoint |
| Non-root user's UID/GID | Dynamic — build args fed from the *host* user (`${localEnv:UID}`/`GID`) so bind-mounted files aren't root-owned on the host | Fixed/pinned deliberately, independent of whoever eventually runs the container |
| `sudo` | Often granted passwordless, for devcontainer automation (ownership fixups on fresh volumes) | Never present at all |
| Version pinning | Loose is acceptable (`python:3.13-slim`, unpinned OS packages) — rebuilt often, blast radius is one developer's laptop | Strict, ideally digest-pinned — this is what actually deploys |
| Extra tooling | Linters, formatters, editor-extension runtime deps, git, curl, language servers | Only what the running application needs |
| Shell ergonomics | Custom prompt, persistent history, sourced interactive helper menu (bash or zsh, either is fine) | None expected |
| Rebuild frequency | Frequent (every tool version bump) | Only on release |

If you catch yourself writing `COPY . .` or an `ENTRYPOINT` that runs the application in a file
under `.devcontainer/`, stop — that almost always belongs in the *other* Dockerfile.

## 2. The generic backbone (identical regardless of language/stack)

This part does not change whether the project is Bash, Python, PHP, Node, Go, or anything else.
Get this right once and reuse it verbatim.

### 2a. Build args for host user matching

```dockerfile
ARG USERNAME=vscode
ARG USER_UID=1000
ARG USER_GID=1000
```

These must line up with `devcontainer.json`'s `build.args` (`${localEnv:UID}`/`${localEnv:GID}`)
— see the `devcontainer-best-practices` skill §1 for the host-side half of this (including the
gotcha that `$GID` isn't a bash builtin and must be exported manually).

### 2b. Timezone

```dockerfile
ENV TZ=Europe/Brussels
```

Keeps `date`, log timestamps, and anything schedule-sensitive consistent with what the team
expects, instead of defaulting to UTC or whatever the Docker host happens to be set to.

### 2c. Passwordless sudo — devcontainer-only, never copy into production

```dockerfile
RUN echo "vscode ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers
```

Justify this inline with *why* (typically: a `postStartCommand` needs to `chown` a freshly created,
root-owned named volume — see the other skill §3b). This is acceptable for a disposable,
single-developer, local-only image. It must never be copy-pasted into the project's production
Dockerfile — flag it in review if it ever shows up there.

### 2d. Create the user with the matching UID/GID, with a safe fallback

```dockerfile
RUN set -eux && \
    USER_UID=${USER_UID:-1000} && \
    USER_GID=${USER_GID:-1000} && \
    groupadd -g "${USER_GID}" "${USERNAME}" && \
    useradd -l -m -u "${USER_UID}" -g "${USER_GID}" -s /bin/bash "${USERNAME}" && \
    chown -R "${USERNAME}:${USERNAME}" "/home/${USERNAME}"

USER ${USERNAME}
```

Switch `USER` immediately after creating it — every subsequent `RUN` that touches
`/home/${USERNAME}` should run as that user, not root, so ownership doesn't need fixing up later
for anything baked into the image itself (only for volumes attached later at runtime, which the
image build can't touch).

The `-s /bin/bash` here is the login shell, not a hard requirement — swap it for `-s
/usr/bin/zsh` (installing `zsh` first) if that's the team's/your own preference, and keep it
consistent with whichever rc file gets configured in §2f below. Nothing else in this recipe cares
which shell is chosen; only 2f's rc-file target and history directives need to match.

### 2e. Pre-create mount points before they're mounted

Anything `devcontainer.json` will bind-mount or volume-mount onto a path under
`/home/${USERNAME}` needs that path to exist first, with the right permissions, so the first mount
lands cleanly:

```dockerfile
# SSH: devcontainer.json bind-mounts the host's ~/.ssh here, read-only
RUN mkdir -p /home/${USERNAME}/.ssh && \
    chmod 700 /home/${USERNAME}/.ssh

# Shell history: devcontainer.json mounts a named volume as a *directory* here —
# see the devcontainer-best-practices skill §3a for why it must be file-inside-directory,
# not a direct file mount. Directory/file names below assume bash; for zsh, rename
# both to .zsh_history and point ZDOTDIR/HISTFILE at it instead (see §2f).
RUN mkdir -p /home/${USERNAME}/.bash_history /home/${USERNAME}/.cache && \
    touch /home/${USERNAME}/.bash_history/.bash_history && \
    chown -R ${USERNAME}:${USERNAME} /home/${USERNAME}
```

A volume mount replaces whatever's at that path at container start, so this step is really only
about giving the *first* boot (before any volume exists) something sane to work with — the
recurring fix-up for a fresh, root-owned volume happens in `postStartCommand`, not here (the image
build never sees the runtime volume).

### 2f. Shell ergonomics — configure the interactive shell (bash or zsh)

"Configure the interactive shell" means the same three things regardless of which shell the team
prefers — persistent history, a recognizable prompt, and sourcing the project's own helper
script — only the rc file and the history directive differ:

| | bash | zsh |
| --- | --- | --- |
| rc file appended to | `~/.bashrc` | `~/.zshrc` |
| history append directive | `shopt -s histappend` | `setopt APPEND_HISTORY INC_APPEND_HISTORY` |
| history size vars | `HISTSIZE`, `HISTFILESIZE` | `HISTSIZE`, `SAVEHIST` |
| prompt var | `PS1` | `PROMPT` (`PS1` also works, `PROMPT` is idiomatic) |

```dockerfile
# bash
RUN { \
      echo "export HISTFILE=/home/${USERNAME}/.bash_history/.bash_history"; \
      echo 'export HISTSIZE=10000'; \
      echo 'export HISTFILESIZE=10000'; \
      echo 'shopt -s histappend'; \
    } >> /home/${USERNAME}/.bashrc

# hadolint ignore=SC2028
RUN echo "PS1='\n\e[0;33m🐳 \e[0;36m\$(whoami)\e[0m \w # '" >> /home/${USERNAME}/.bashrc && \
    cat <<'EOF' >> /home/${USERNAME}/.bashrc
[ -f "${APP_HOME}/.devcontainer/scripts/interactive.sh" ] && source "${APP_HOME}/.devcontainer/scripts/interactive.sh"
EOF
```

```dockerfile
# zsh — same three things, different rc file and history directives
RUN { \
      echo "export HISTFILE=/home/${USERNAME}/.zsh_history/.zsh_history"; \
      echo 'export HISTSIZE=10000'; \
      echo 'export SAVEHIST=10000'; \
      echo 'setopt APPEND_HISTORY INC_APPEND_HISTORY'; \
    } >> /home/${USERNAME}/.zshrc

RUN echo "PROMPT='%F{yellow}🐳 %F{cyan}%n%f %~ # '" >> /home/${USERNAME}/.zshrc && \
    cat <<'EOF' >> /home/${USERNAME}/.zshrc
[ -f "${APP_HOME}/.devcontainer/scripts/interactive.sh" ] && source "${APP_HOME}/.devcontainer/scripts/interactive.sh"
EOF
```

The `[ -f ... ] &&` guard matters: at image-build time the workspace isn't bind-mounted yet, so any
helper script that lives in the repo (not baked into the image) must be sourced conditionally —
it will exist by the time a real shell opens inside the running container, but not during `docker
build`. `[ -f ... ]` is POSIX `test`, so the same guard line works verbatim in both bash and zsh.

**What `interactive.sh` actually is.** It's not part of the Dockerfile's job to define — the image
only sources it conditionally, as above. The script itself is ordinary, version-controlled,
project-repo content (bash-shebanged even if the login shell is zsh, since it only needs to be
*sourced*, not exec'd) that turns every fresh interactive shell into a live cheatsheet for the
project's own workflow: it defines a handful of functions, annotates each with lightweight
`# @cat`/`# @cmd`/`# @desc` comments, and prints a categorized command menu on shell start by
parsing its own source with `awk`. This skill's own repo carries a concrete, working example at
`.devcontainer/scripts/interactive.sh`: it defines `check`/`fix`/`welcome` this way, plus a
`__register_dotfiles_autocomplete` helper that wires bash tab-completion for every `@cmd`-annotated
function — worth opening directly for the full pattern rather than reproducing it here. Because the
script lives in the repo rather than being baked into the image, it can be edited freely without a
container rebuild — only the *sourcing* line in the Dockerfile is fixed; the menu's actual content
is entirely the project's to define.

### 2g. Never COPY application source, never set an app ENTRYPOINT

The whole point of a devcontainer image is that the workspace is bind-mounted live by the editor —
edits on the host appear instantly inside the container and vice versa, with no rebuild. `COPY`ing
source in would freeze a stale snapshot and defeat that. Leave `ENTRYPOINT`/`CMD` at the base
image's default (an interactive shell) or omit them — the container is meant to be attached to,
not run-and-exited.

## 3. The one genuinely stack-dependent part: tool installation

Base image choice and the linters/formatters/runtimes you install *do* depend on the project's
primary language(s). Treat this as a swappable block inside the generic backbone above — pick the
row(s) that match the project, possibly more than one if the repo is polyglot:

| Stack | Typical base image | Package manager | Common dev tools to install | Pin how |
| --- | --- | --- | --- | --- |
| Bash / shell-heavy | `debian:*-slim`, `python:*-slim` (if you also need `pre-commit`) | `apt` | `shellcheck` (apt), `shfmt` (binary release download), `hadolint` (binary release download), `bats` (often supplied by an external CI image instead of baked in) | Binary downloads pinned to an exact release tag/version, matching whatever CI enforces |
| Python | `python:3.x-slim` | `uv` (preferred — single static binary, no bootstrap dependency; fall back to `pip`/`pipx` only for a project that hasn't migrated yet) | `pre-commit`, `ruff`/`black`/`flake8`, `mypy`, `pytest` | `uv tool install <tool>` (global CLI) or `uv add --dev <tool>` (project-scoped, resolved via `uv.lock`), matching whatever CI uses |
| PHP | `php:8.x-cli`, or multi-stage `COPY --from=composer:2` | `composer` | `phpcs`/`php-cs-fixer`, `phpstan`/`psalm`, `phpunit` | `composer global require <tool>:<version>`, or project `composer.json` dev deps |
| Node / TypeScript | `node:*-slim`, or install Node via NodeSource on a non-Node base (as with Python-based images needing JS-only tooling like `cspell`) | `npm`/`pnpm`/`yarn`, `corepack` | `eslint`, `prettier`, `typescript`, project-specific CLI | `npm install -g <tool>@<version>`, or rely on the project's own `devDependencies` via `npx` |
| Go | `golang:*` | `go install` | `golangci-lint`, `staticcheck` | `go install tool@version`, or the tool's own pinned install script |

Regardless of stack, the same rules apply to this block:

- **Pin explicitly and say why**, especially for anything CI also runs — e.g. a Dockerfile comment
  like *"pinned to the same version used in CI so local linting never drifts from what CI
  enforces"* is worth more than the pin itself; it tells the next editor why bumping it casually is
  risky.
- **Use `--mount=type=cache`** for the package manager's cache directory (`/var/cache/apt`,
  `~/.npm`, `~/.cache/uv` (or `~/.cache/pip` on a project still on `pip`), `~/.composer/cache`, Go's
  module cache) so rebuilds are fast without bloating any single layer — irrelevant for final image
  size here since a devcontainer image is never shipped, but it directly affects how long `Rebuild
  Container` takes.
- **Clean up package-manager lists/caches that aren't `--mount`-cached** (`rm -rf
  /var/lib/apt/lists/*` after an `apt-get install` that wasn't run under a cache mount for that
  directory).
- Install a tool via a **pinned binary release download** (curl + chmod) rather than the distro's
  package manager whenever you need an exact version the distro doesn't ship — this is why `shfmt`
  and `hadolint` are typically fetched from GitHub releases directly instead of `apt install`.
- If the repo is polyglot (e.g. Bash scripts *and* a Python-based pre-commit/tooling layer, as is
  common), it's normal for the tool-install block to combine two rows from the table above in one
  image — that's still one devcontainer image, just with two toolchains layered in.

## 4. Lint the devcontainer Dockerfile too

`hadolint` (or your stack's Dockerfile linter) should run against `.devcontainer/Dockerfile` the
same as any other Dockerfile. The loosened pinning discipline from §1 (a floating tag like
`python:3.13-slim` instead of a digest) is a deliberate, acceptable exception here — silence the
specific hadolint rule inline with a comment explaining why, don't disable linting for the file
wholesale.

## Checklist for a new devcontainer Dockerfile

- [ ] Confirmed this is the *devcontainer* image, not the project's production image — no
      `COPY <app source>`, no application `ENTRYPOINT`/`CMD`.
- [ ] `ARG USERNAME`/`USER_UID`/`USER_GID` present, with fallback defaults, matching
      `devcontainer.json`'s `build.args`.
- [ ] `ENV TZ=...` set to the team's expected timezone.
- [ ] Passwordless `sudo` (if granted) has an inline comment explaining exactly what runtime step
      needs it.
- [ ] Non-root user is created with the dynamic UID/GID and the image switches `USER` to it before
      any per-user file setup.
- [ ] Mount points that `devcontainer.json` will later bind/volume-mount onto
      (`~/.ssh`, shell-history directory, cache dirs) are pre-created with correct ownership/perms.
- [ ] Shell history is wired via `HISTFILE` (bash or zsh — §2f) pointing at a file *inside* a
      directory-shaped mount point, not mounted directly as a file, and the login shell set in §2d
      (`-s /bin/bash` / `-s /usr/bin/zsh`) matches whichever rc file got configured.
- [ ] Any sourced helper script that lives in the repo (not the image) is guarded with
      `[ -f ... ] &&` since it won't exist yet at build time.
- [ ] Tool-install block matches the project's actual stack(s) (§3's table), each tool pinned and
      the pin's rationale documented inline where it mirrors a CI-enforced version.
- [ ] Package manager caches use `--mount=type=cache`; anything else cleans up after itself in the
      same `RUN` layer.
- [ ] The file passes the project's own Dockerfile linter, with any loosened-pinning exceptions
      commented, not silently ignored.
