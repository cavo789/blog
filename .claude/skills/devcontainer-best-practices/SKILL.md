---
name: devcontainer-best-practices
description: Generic, project-agnostic recipe for a best-in-class devcontainer.json + companion Dockerfile — host UID/GID matching, read-only credential mounts, per-project named volumes for persistent state (bash history, caches, tool config), bootstrapping external CLI tools via docker-outside-of-docker, and the postCreate/postStart/postAttach split. Not tied to any single stack; drop into any repo's .devcontainer/.
disable-model-invocation: false
---

# DevContainer Best Practices

A checklist-driven recipe for `devcontainer.json` + its `Dockerfile`, distilled from a working
setup. Every pattern here is generic — no project-specific tool names, paths, or registries. Swap
the placeholders (`<project>`, `mytool`, `MYTOOL_*`) for your own.

The core idea running through every section: **the container should feel like the host, minus the
mess.** Same user identity, same git identity, same SSH keys, same shell history — but disposable,
reproducible, and rebuildable without losing any of that state.

## 1. Match the container user to the host user

Editing files inside the container as a UID that doesn't match the host user is the single most
common source of "why are these files suddenly owned by root" devcontainer complaints. Fix it at
the build args level.

**`devcontainer.json`:**

```jsonc
{
  "build": {
    "dockerfile": "Dockerfile",
    "args": {
      "USER_UID": "${localEnv:UID}",
      "USER_GID": "${localEnv:GID}"
    }
  },
  "remoteUser": "vscode"
}
```

**`Dockerfile`:**

```dockerfile
ARG USERNAME=vscode
ARG USER_UID=1000
ARG USER_GID=1000

RUN set -eux && \
    USER_UID=${USER_UID:-1000} && \
    USER_GID=${USER_GID:-1000} && \
    groupadd -g "${USER_GID}" "${USERNAME}" && \
    useradd -l -m -u "${USER_UID}" -g "${USER_GID}" -s /bin/bash "${USERNAME}" && \
    chown -R "${USERNAME}:${USERNAME}" "/home/${USERNAME}"

USER ${USERNAME}
```

**Gotcha — `$UID` and `$GID` are not the same kind of variable.** Bash auto-sets `UID` as a
readonly variable and (in modern bash) auto-exports it, so `${localEnv:UID}` usually resolves for
free. `GID` is **not** a bash builtin at all — it will resolve to an empty string unless the host
user explicitly exports it, e.g. in `~/.bashrc` / `~/.zshrc`:

```bash
export GID="$(id -g)"
```

If `GID` is empty, `${localEnv:GID}` passes an empty build arg, and the Dockerfile's
`${USER_GID:-1000}` fallback silently kicks in — which may or may not match the host's real GID.
Document this requirement prominently (e.g. in the repo's setup README), because the failure mode
(bind-mounted files owned by a mismatched GID) is confusing and easy to miss.

## 2. Mount host identity/credentials, read-only

Bind-mount what the container needs to *act as you* — SSH keys, git identity — but never let the
container write back to them.

```jsonc
{
  "mounts": [
    "source=${localEnv:HOME}/.ssh,target=/home/vscode/.ssh,type=bind,readonly",
    "source=${localEnv:HOME}/.gitconfig,target=/home/vscode/.gitconfig,type=bind,readonly"
  ],
  "containerEnv": {
    "GIT_SSH_COMMAND": "ssh -i /home/vscode/.ssh/id_ed25519 -o 'StrictHostKeyChecking no'"
  }
}
```

- `readonly` is not optional — a container process should never be able to modify the host's real
  SSH keys or git config.
- The Dockerfile must still pre-create the mount point with the right ownership/permissions
  (`mkdir -p /home/vscode/.ssh && chmod 700 /home/vscode/.ssh`) *before* the user switch, otherwise
  the bind mount lands with whatever ownership Docker defaults to.
- If the host's known SSH key file name varies per developer, avoid hardcoding `id_ed25519` in
  `GIT_SSH_COMMAND` unless the team convention guarantees it — otherwise make it configurable.

## 3. Persist state in named volumes, scoped per project

Anything that should survive a container rebuild — but doesn't belong in the host's home
directory or in git — goes in a named Docker volume, scoped with
`${localWorkspaceFolderBasename}` so every project gets its own independent copy instead of
clobbering a shared one:

```jsonc
{
  "mounts": [
    "source=${localWorkspaceFolderBasename}-bashhistory,target=/home/vscode/.bash_history,type=volume",
    "source=${localWorkspaceFolderBasename}-cache,target=/home/vscode/.cache,type=volume"
  ]
}
```

Typical candidates: shell history, tool caches (`~/.cache`), any CLI's own config/state directory
that's expensive to regenerate or that the user wants to carry across rebuilds.

**Why volumes instead of bind-mounting a host directory:** a named volume is managed entirely by
Docker — no host-side directory to create, no host-side permission drift, and it's trivially
per-project via the name prefix. The tradeoff is that a *fresh* volume is created and owned by
`root:root` on first use, which the next two sections both have to work around.

### 3a. Bash history needs a directory-shaped volume, not a file-shaped one

Docker named volumes always mount as **directories**, never as a single file — so you cannot mount
a volume directly onto `~/.bash_history` (which bash expects to be a file). The working pattern is
to mount the volume as a directory and point `HISTFILE` at a file *inside* it:

**`devcontainer.json`:**

```jsonc
"source=${localWorkspaceFolderBasename}-bashhistory,target=/home/vscode/.bash_history,type=volume"
```

**`Dockerfile`** (create the file inside that soon-to-be-mounted directory so the first boot has
something to append to, and configure bash to use it):

```dockerfile
RUN mkdir -p /home/${USERNAME}/.bash_history && \
    touch /home/${USERNAME}/.bash_history/.bash_history && \
    chown -R ${USERNAME}:${USERNAME} /home/${USERNAME}

RUN { \
      echo "export HISTFILE=/home/${USERNAME}/.bash_history/.bash_history"; \
      echo 'export HISTSIZE=10000'; \
      echo 'export HISTFILESIZE=10000'; \
      echo 'shopt -s histappend'; \
    } >> /home/${USERNAME}/.bashrc
```

Note `target` is `/home/vscode/.bash_history` (the *directory*), while `HISTFILE` points at
`/home/vscode/.bash_history/.bash_history` (the *file* inside it) — easy to misread as a typo, it
isn't.

### 3b. Fresh volumes are root-owned — fix it in `postStartCommand`

The first time a named volume is created, Docker mounts it as `root:root`, even though the
container's default user is not root. `postStartCommand` runs after the mount is attached, as
whichever user the container starts as, so it's the right place to reclaim ownership (requires
passwordless sudo for that user — see §6):

```jsonc
{
  "postStartCommand": "sudo chown -R vscode:vscode /home/vscode/.bash_history /home/vscode/.cache && touch /home/vscode/.bash_history/.bash_history"
}
```

The trailing `touch` matters: `chown -R` on a *brand-new empty volume* has nothing to chown yet if
the Dockerfile's own `touch` didn't survive into the mounted volume (a volume mount replaces
whatever was at that path in the image), so re-touching after the chown guarantees the history
file exists and is writable by the right user before the shell starts appending to it.

## 4. Bootstrapping an external CLI tool via docker-outside-of-docker

If your workflow depends on a CLI that itself ships as a container image (a CI wrapper, a
linting bundle, an internal tooling binary, etc.), install it *into a persistent volume* on first
container start rather than baking it into the Dockerfile — this keeps the image itself generic
and lets the tool be updated without a rebuild.

**Prerequisite feature:**

```jsonc
{
  "features": {
    "ghcr.io/devcontainers/features/docker-outside-of-docker:1": {
      "version": "latest",
      "moby": false
    }
  },
  "mounts": [
    "source=/var/run/docker.sock,target=/var/run/docker.sock,type=bind",
    "source=${localWorkspaceFolderBasename}-mytool-bin,target=/opt/mytool-bin,type=volume"
  ],
  "containerEnv": {
    "MYTOOL_BIN_VOLUME": "${localWorkspaceFolderBasename}-mytool-bin"
  },
  "postCreateCommand": "bash ${containerWorkspaceFolder}/.devcontainer/scripts/mytool-bootstrap.sh"
}
```

**`mytool-bootstrap.sh`** — the shape that matters:

```bash
#!/usr/bin/env bash
set -euo pipefail

command -v mytool >/dev/null 2>&1 && exit 0   # idempotent: skip if already installed

: "${MYTOOL_BIN_VOLUME:?MYTOOL_BIN_VOLUME is not set — add it via devcontainer.json containerEnv}"
[[ -S /var/run/docker.sock ]] || { echo "docker.sock not found — rebuild the container" >&2; exit 1; }

readonly TOOL_IMAGE="registry.example.com/org/mytool:latest"

# A freshly created named volume is root:root, so an unprivileged --user install
# below would get Errno 13. Fix ownership first via a throwaway root container —
# docker-outside-of-docker allows an arbitrary --user even from a non-root
# devcontainer, so this works regardless of who runs the bootstrap.
docker run --rm --user 0:0 --entrypoint chown \
    -v "${MYTOOL_BIN_VOLUME}:/install/dir" \
    "${TOOL_IMAGE}" -R "$(id -u):$(id -g)" /install/dir

docker run --rm --user "$(id -u):$(id -g)" \
    -v "${MYTOOL_BIN_VOLUME}:/install/dir" \
    -e HOME=/tmp \
    "${TOOL_IMAGE}" install --dir /install/dir --no-modify-rc

BASHRC="${HOME}/.bashrc"
if ! grep -q "# >>> mytool >>>" "${BASHRC}" 2>/dev/null; then
    {
        echo ""
        echo "# >>> mytool >>>"
        echo "export PATH=\"/opt/mytool-bin:\${PATH}\""
        echo "# <<< mytool <<<"
    } >> "${BASHRC}"
fi
```

The reusable shape: **feature → docker.sock bind mount → named volume for the tool's install
dir → containerEnv carrying the volume name into the script → postCreateCommand running an
idempotent bootstrap script that (1) chowns the volume via a throwaway root container, (2)
installs via a container run as the real uid/gid, (3) appends a guarded PATH block to `.bashrc`.**
Keep the bootstrap script non-fatal for anything optional (e.g. an editor extension it also
installs) so a network hiccup on one sub-step doesn't break container startup outright.

## 5. Give scripts both host and container paths when they need to talk to Docker

Any script invoked *from inside* the devcontainer that itself shells out to `docker run` (bind
mounts, docker-outside-of-docker) needs the **host** path for `-v` mount sources — the container's
own filesystem paths are meaningless to the host Docker daemon. Pass both explicitly via
`containerEnv` rather than trying to derive one from the other at runtime:

```jsonc
{
  "containerEnv": {
    "APP_HOME": "${containerWorkspaceFolder}",
    "HOST_WORKSPACE": "${localWorkspaceFolder}",
    "CONTAINER_WORKSPACE": "${containerWorkspaceFolder}"
  }
}
```

`${localWorkspaceFolder}` and `${containerWorkspaceFolder}` are devcontainer.json's own
predefined variables for exactly this — resist the temptation to hardcode either path or to guess
one from the other.

## 6. Passwordless sudo — only for the operations you actually automate

`postStartCommand`'s chown fix (§3b) needs root. Rather than running the whole container as root,
grant the non-root user passwordless `sudo` in the image and use it narrowly:

```dockerfile
RUN echo "vscode ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers
```

This is a devcontainer (local, disposable, single-developer), not a production image — the
tradeoff is reasonable here. It is *not* a pattern to carry into a production Dockerfile; keep
devcontainer hardening and production-image hardening as two separate concerns with two separate
files.

## 7. `postCreateCommand` vs `postStartCommand` vs `postAttachCommand`

Pick the right hook — using the wrong one either wastes time (re-running an expensive step on
every start) or misses a needed fix-up (skipping a step that only makes sense once the container
is actually running):

| Hook | Runs | Use for |
| --- | --- | --- |
| `postCreateCommand` | Once, right after the container is first created (and after a rebuild) | Expensive/idempotent installs — bootstrapping an external tool into a volume (§4), one-time setup |
| `postStartCommand` | Every time the container starts (including a plain restart, not just create) | Fixing up state that a fresh volume/mount resets — ownership chown (§3b) |
| `postAttachCommand` | Every time an editor window attaches to the (already-running) container | Editor/session-scoped setup — installing git hooks, printing a welcome banner |

```jsonc
{
  "postCreateCommand": "bash ${containerWorkspaceFolder}/.devcontainer/scripts/mytool-bootstrap.sh",
  "postStartCommand": "sudo chown -R vscode:vscode /home/vscode/.bash_history /home/vscode/.cache && touch /home/vscode/.bash_history/.bash_history",
  "postAttachCommand": "[ -f .pre-commit-config.yaml ] && pre-commit install || true"
}
```

`postAttachCommand` in particular should always fail soft (`|| true`) for anything that's a
convenience rather than a hard requirement — a missing config file shouldn't block attaching.

## 8. VS Code customizations — point at the repo's real config locations

If the repo keeps tool config out of its root (a common convention — e.g. everything under
`.config/`), tell each extension explicitly where to look instead of relying on default discovery:

```jsonc
{
  "customizations": {
    "vscode": {
      "extensions": ["esbenp.prettier-vscode", "timonwong.shellcheck", "..."],
      "settings": {
        "[shellscript]": {
          "editor.defaultFormatter": "foxundermoon.shell-format",
          "shellformat.path": "/usr/local/bin/shfmt"
        },
        "editor.formatOnSave": true,
        "files.readonlyInclude": {
          ".devcontainer/generated/**": true
        },
        "some-linter.configPath": ".config/some-linter.toml"
      }
    }
  }
}
```

`files.readonlyInclude` is worth using for anything generated/vendored that a human editing it by
hand would be a mistake — cheaper than a code-review comment.

## 9. Timezone and other environment consistency

If logs, timestamps, or scheduled-job semantics matter to the project, pin the timezone in both
the image and the container env so `date`/cron-like behavior inside the container matches what
the team expects, rather than defaulting to UTC or the host's timezone:

```dockerfile
ENV TZ=Europe/Brussels
```

```jsonc
{
  "containerEnv": {
    "TZ": "Europe/Brussels"
  }
}
```

## Checklist for a new devcontainer.json

- [ ] `build.args` passes `USER_UID`/`USER_GID` from `${localEnv:UID}`/`${localEnv:GID}`; the repo
      docs tell developers to `export GID="$(id -g)"` in their shell rc file.
- [ ] Dockerfile creates the user with those UIDs/GIDs, with a sane fallback default.
- [ ] `~/.ssh` and `~/.gitconfig` are bind-mounted **read-only**.
- [ ] Anything that should survive a rebuild (history, caches, tool state) is a named volume
      prefixed with `${localWorkspaceFolderBasename}`, not a bind mount to a host path.
- [ ] Bash history uses the directory-volume + `HISTFILE`-inside-it pattern, not a direct file
      mount.
- [ ] `postStartCommand` reclaims ownership of any volume that a fresh mount hands back as
      `root:root`, and re-touches any file that must exist before the shell starts.
- [ ] External CLI tools installed via docker-outside-of-docker go into their own named volume,
      bootstrapped idempotently in `postCreateCommand`, with the volume name passed through
      `containerEnv`.
- [ ] Scripts that shell out to `docker run -v` get both `localWorkspaceFolder` (host path) and
      `containerWorkspaceFolder` (container path) via `containerEnv` — never guessed or hardcoded.
- [ ] `postCreateCommand` / `postStartCommand` / `postAttachCommand` are each used for what they're
      *for* (§7) — nothing expensive re-runs on every plain restart.
- [ ] Passwordless sudo, if granted, is scoped in spirit to devcontainer-only automation, never
      copy-pasted into a production Dockerfile.
- [ ] VS Code settings point at the repo's actual config file locations, not tool defaults.
