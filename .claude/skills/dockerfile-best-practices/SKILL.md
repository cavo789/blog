---
name: dockerfile-best-practices
description: Generic, project-agnostic Dockerfile best practices, structured as MUST/SHOULD/MAY plus a reviewer's question list and contrastive anti-patterns — BuildKit syntax pragma, Buildx, multi-stage targets (base/builder/runtime/development/production), layer ordering, cache/secret/ssh mounts, ARG-pinned tool versions and UID/GID, digest-pinned base images, non-root user, HEALTHCHECK, OCI labels, .dockerignore, uv over pip. Applies to any Dockerfile, regardless of location — a devcontainer image, a project's production image, or a CI-only build image. For the devcontainer-specific dev-image backbone (host UID/GID matching, bash/zsh history mount, never COPY app code), see the sibling devcontainer-dockerfile-best-practices skill instead.
disable-model-invocation: false
---

# Dockerfile Best Practices

Current as of August 2026 (BuildKit/Buildx-era Docker). Applies to any Dockerfile — this repo's
own `.devcontainer/Dockerfile`, a project's production image, or a CI-only build image.

If the Dockerfile in question is specifically the one behind `devcontainer.json`'s
`build.dockerfile` — the image a developer works *inside*, never shipped — check the sibling
`devcontainer-dockerfile-best-practices` skill first for that backbone. This skill is the general
layer underneath: it applies regardless of which Dockerfile it is.

Rules below are tiered **MUST** (non-negotiable) / **SHOULD** (strong default, deviate with a
reason) / **MAY** (contextual, adopt when it pays for itself). The **Reference** section holds the
syntax the rules point at; **Review criteria** and **Anti-patterns** are for auditing an existing
file.

## Reference

### Stage layout

Name stages so one file serves every consumer via `docker build --target <name>`. What `builder`
means depends on whether the stack compiles anything.

**Compiled stacks** (Go, Rust, C, a bundled JS/CSS build step):

| Stage | Contains | Never contains |
| --- | --- | --- |
| `base` | Base image, `ENV`, non-root user, locale | Compilers, application code |
| `builder` | Compiler/toolchain that produces the artifact | Anything not `COPY --from=builder`'d out |
| `runtime` | Only the compiled artifact + what it needs to execute | Compiler, build cache, dev tools, docs, tests |
| `development` | `runtime`/`base` + editor/debug tooling | Never shipped |
| `production` | Usually `runtime` + final `USER`/`HEALTHCHECK`/`CMD` | Anything from `development` |

**Interpreted stacks with no compile step** (Bash, Python, PHP, plain Node) — `builder` installs
the dependencies *common* to every downstream stage; `development`/`production` branch off it:

| Stage | Contains | Never contains |
| --- | --- | --- |
| `base` | Base image, `ENV`, non-root user, locale | Any dependency, application code |
| `builder` | Deps shared by dev and prod (`uv sync --frozen --no-dev`, `composer install --no-dev`) | Dev-only tooling, prod-only extras |
| `development` | `FROM builder` + dev-only deps (`pytest`, `xdebug`/`debugpy`, linters) | Shipped to production |
| `production` | `FROM builder` + prod-only extras if any, hardened per "Stripping runtime" below | Compilers, dev deps, test files |

```dockerfile
FROM base AS builder
COPY pyproject.toml uv.lock ./
RUN --mount=type=cache,target=/root/.cache/uv uv sync --frozen --no-dev

FROM builder AS development
RUN --mount=type=cache,target=/root/.cache/uv uv sync --frozen
COPY src/ src/

FROM builder AS production
COPY src/ src/
USER app
HEALTHCHECK CMD [...]
```

### Pinning base images

```dockerfile
FROM python:3.14.2                        # worst: OS underneath the tag can shift on rebuild
FROM python:3.14.2-slim-bookworm           # better: OS explicit, tag can still be repushed
FROM python:3.14.2-slim-bookworm@sha256:…  # best: immutable, byte-for-byte reproducible
```

Digest-pin resolved once via `docker inspect --format='{{index .RepoDigests 0}}' <image>`, or let
Renovate/Dependabot manage the bump — same trade a lockfile already makes. A devcontainer image is
the accepted exception (rebuilt often, disposable, see the sibling skill).

A tag that is itself a **deterministic content-hash of its own build inputs** — a CI job that
hashes a base Dockerfile plus its build context and tags the resulting image with that hash, then
every consumer `FROM`s the exact hash tag — satisfies this bar too, even though it is not literally
an `@sha256:` digest. The property that matters is "this reference can only ever resolve to one set
of bytes," not the specific syntax that guarantees it; a monorepo's own shared-base-image pipeline
(Reference: monorepo shared `base`, under MAY) commonly produces exactly this shape. Don't flag it
as a missing digest — verify the hash is actually derived from the image's real inputs (not just an
incrementing counter or a date) before accepting it as equivalent.

### Build mechanics: syntax pragma, Buildx, `--mount`

```dockerfile
# syntax=docker/dockerfile:1.9
```
Pin an exact minor version as line 1 — unlocks `--mount`, heredocs, `COPY --chmod`.

Since Docker Engine 23, plain `docker build` is already BuildKit-backed by default — no
`DOCKER_BUILDKIT=1` needed. Reach for `docker buildx build` explicitly (or a created builder
instance) only for what the default driver can't do:

- Multi-platform: `docker buildx build --platform linux/amd64,linux/arm64 -t img:tag .`
- Remote cache backends: `--cache-to type=registry,ref=... --cache-from type=registry,ref=...`
  (or `type=gha` in GitHub Actions)
- A non-default builder: `docker buildx create --use` (needed to `--load` a multi-platform result)

`RUN --mount=type=...` replaces baking a cache or credential into a layer:

| Type | Use | Example |
| --- | --- | --- |
| `cache` | Package-manager cache survives across builds, never lands in the image | `RUN --mount=type=cache,target=/var/cache/apt apt-get install -y curl` |
| `bind` | Mount a context file for one `RUN` without `COPY`-ing it into a layer | `RUN --mount=type=bind,source=pyproject.toml,target=pyproject.toml uv sync` |
| `ssh` | Forward the host's SSH agent for a private `git clone`/registry | `RUN --mount=type=ssh git clone git@example.com:org/repo.git` |
| `secret` | The only acceptable way to hand a `RUN` a token — never `ARG`/`ENV` | `RUN --mount=type=secret,id=gitlab_token sh -c 'TOKEN=$(cat /run/secrets/gitlab_token); ...'` |

Built with `docker build --secret id=gitlab_token,src=./token.txt` — the value never touches a
layer, `docker history`, or the final image.

### Layer ordering, `COPY` targeting, ownership, and merged `RUN`

```dockerfile
# Good: dependency layer only invalidates when the lockfile changes
COPY pyproject.toml uv.lock ./
RUN --mount=type=cache,target=/root/.cache/uv uv sync --frozen
COPY src/ src/
```

Scope `COPY` per concern (`COPY app/ app/`, `COPY config/ config/`) instead of `COPY . .`. Set
ownership/permissions on the copy itself, not a follow-up layer:

```dockerfile
COPY --chmod=755 --chown=app:app scripts/entrypoint.sh /usr/local/bin/entrypoint.sh
```

Merge one logical step into one `RUN`, cleaned up in the same instruction:

```dockerfile
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl git \
    && rm -rf /var/lib/apt/lists/*
```

Keep genuinely distinct steps (OS packages vs. language deps vs. build script) as separate `RUN`s —
that's where the layer cache does useful work.

A `RUN chmod`/`RUN chown` immediately after a `COPY --chmod`/`--chown` of the same path pattern-
matches the "ownership fixed up after the fact" anti-pattern below, but check what the `RUN` is
actually for before flagging it. If its real job is something else that has to touch every file in
that tree anyway — a CRLF normalization sweep (`find … -exec sed -i 's/\r$//'`), a checksum
verification pass — then a chmod riding along in the same instruction is a free rider, not the
defect: the layer cache doesn't care that the mode was already correct, and splitting it into its
own `RUN` just to "avoid the redundant chmod" would add a layer for no benefit. The anti-pattern is
a `RUN` whose *only* job is the chmod/chown that `COPY` could have done inline — not any `RUN` that
happens to include one.

### `ARG`-pinned tool versions and non-root `UID`/`GID`

```dockerfile
ARG FZF_VERSION=0.73.1
RUN curl -fL -sS "https://github.com/junegunn/fzf/releases/download/v${FZF_VERSION}/fzf-${FZF_VERSION}-linux_amd64.tar.gz" \
    | tar -xz -C /usr/local/bin fzf

ARG APP_UID=1000
ARG APP_GID=1000
RUN groupadd -g "${APP_GID}" app && useradd -u "${APP_UID}" -g app -m app
USER app
```

`--build-arg` overrides either without editing the file — a version bump or a UID collision fix
becomes a one-line diff.

### Stripping `runtime`/`production`

Distroless/Chainguard philosophy: `runtime`/`production` should ship as little as possible — no
package manager (with cache attached), no compiler/build toolchain, no docs, no test fixtures, no
example code, and for a statically-compiled binary, ideally no shell at all (`FROM scratch` /
`gcr.io/distroless/static` / a Chainguard static image).

Interpreted stacks (Bash, Python, PHP) still need an interpreter/shell, so full shell-less
distroless isn't reachable — but everything *else* still applies: no `gcc`/`build-essential` in the
shipped stage (compile only in `builder`, `COPY --from=builder` the result), no leftover package
cache, no dev dependencies/tests/docs. Consider a hardened base for `runtime` specifically (e.g.
`cgr.dev/chainguard/python`) even when `builder`/`development` use a fuller one — each stage has
its own `FROM`.

### Read-only / tmpfs compatibility

`docker run --read-only` mounts the whole image filesystem read-only; only paths given an explicit
`--tmpfs` mount or a volume stay writable. Any runtime write outside those paths crashes or fails
silently. Most of this needs actually running the built image to confirm, but several predictive
signals are visible in the Dockerfile alone:

| Base / installed package | Writes at runtime to | Needs |
| --- | --- | --- |
| `nginx` | `/var/cache/nginx`, `/var/run`, `/var/log/nginx` (the official image already redirects logs to stdout/stderr) | `--tmpfs /var/cache/nginx --tmpfs /var/run` |
| `apache2`/`httpd` | `/var/run/apache2`, `/var/log/apache2` | `--tmpfs /var/run/apache2` |
| `mysql`/`postgres`/`mongo`/`redis` | Its data directory (`/var/lib/mysql`, `/var/lib/postgresql/data`, …) | A real `VOLUME` — this is state, a `tmpfs` would lose it on restart |
| `php-fpm` | `/run/php`, session save path | `--tmpfs /run/php` |
| Any daemon/process manager | A PID file, usually under `/run` or `/var/run` | `--tmpfs /run` |
| A CI/build-tool image (linter, test runner, static analyzer) with a shared package-manager cache (`npm`/`composer`/`pip`/`uv`) redirected via env var (`NPM_CONFIG_CACHE`, `COMPOSER_CACHE_DIR`, …) to a fixed path outside `$HOME` | That fixed path, created `chmod 1777` (world-writable + sticky, not owner-only) | `VOLUME` on that path is the signal a caller needs; the `1777` mode itself is a deliberate multi-UID idiom — this class of image is commonly run under whatever UID the CI runner assigns per job (not always the image's declared `APP_UID`), so the cache dir has to stay writable regardless of who's inside. Don't flag the `1777` as an overly-broad-permissions anti-pattern on its own — check whether it's paired with a runtime cache-dir env var first; that combination is the legitimate pattern, a bare `chmod -R 777` on an app directory with no such pairing is the actual anti-pattern. |

Beyond the table, four static signals in the Dockerfile itself predict a `--read-only` failure.
Two are directly grep-able from the Dockerfile's own instructions — flag these as findings, not
open questions:

1. **`RUN mkdir`/`RUN touch` creating a path that survives into `runtime`/`production`** (not
   `builder`-only) **with no matching `VOLUME`** — a strong signal the app writes there at runtime
   and the image never declared it, so a caller has no way to know it needs a mount.
2. **`RUN chmod -R 777 <dir>` or similarly broad ownership changes on an app directory** — usually
   a workaround for "this needs to be writable at runtime" papered over with a blanket permission
   instead of a scoped `VOLUME`/`tmpfs` mount. Exception: `1777` (not `777`) on a dedicated
   package-manager cache dir fed by a matching cache-dir env var is the legitimate multi-UID CI
   idiom from the table above — the missing `VOLUME` is still the finding, the permission mode
   itself is not.

The other two need broader context than a single instruction gives — worth suggesting to the
developer, but file as a suggestion/open question rather than a static pass/fail:

3. **A language runtime's own cache/bytecode writes left at their default path.** This skill
   already covers the Python case (`PYTHONDONTWRITEBYTECODE`/`PYTHONUNBUFFERED`, below) — the same
   category shows up elsewhere (Node's `~/.npm`, matplotlib's `~/.cache/matplotlib` on first
   import). Redirect via the stack's own cache-dir env var (`XDG_CACHE_HOME`,
   `NPM_CONFIG_CACHE`, `MPLCONFIGDIR`) to a path the caller can `--tmpfs` mount, instead of leaving
   it defaulted under `$HOME`.
4. **The application logs to a file instead of stdout/stderr** — forces a writable log directory
   that `--read-only` breaks. Redirecting to stdout/stderr (the 12-factor default, and what `docker
   logs` already expects) removes the need for a mount entirely rather than requiring one. Whether
   an app actually does this usually isn't visible from the Dockerfile alone (it's a framework/app
   config choice), so suggest checking it rather than asserting it as a finding.

What a Dockerfile alone can't settle at all: whether the application's *own source* writes to some
path invisible to the Dockerfile (a hardcoded temp-file path, a library that caches to `$HOME` on
first use). Full confirmation still needs `docker run --read-only --tmpfs /tmp <image>` against the
built image with its real workload.

### Python bytecode / stdout environment variables

```dockerfile
# Avoid .pyc cache files from build-time pip/pre-commit invocations, and unbuffered stdout for
# any Python process run interactively in this container.
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
```

Stops `.pyc` writes into an ephemeral filesystem; makes stdout/stderr flush immediately so
`docker logs` doesn't appear to hang or reorder. Cost is two `ENV` lines, so default to setting
these on **any Linux-based stage**, not only one whose primary language is Python — a
Debian/Ubuntu/Quarto base, or a polyglot image where Python is only one of several installed
tools, all qualify; a Python interpreter one `RUN` away (`pip`, `pre-commit`, an ad hoc script)
is enough to make the cost-benefit trade worth it. Skip only a stage that genuinely cannot run
Python at all: a PHP-only base (`php:*-fpm`, `php:*-cli`) with no Python installed, or a
shell-less scratch/distroless stage.

### `HEALTHCHECK` and OCI labels

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/healthz || exit 1

LABEL org.opencontainers.image.source="https://github.com/org/repo" \
      org.opencontainers.image.version="1.4.0" \
      org.opencontainers.image.revision="${GIT_SHA}" \
      org.opencontainers.image.licenses="MIT"
```

### `.dockerignore` baseline: exclude secrets, not just build noise

```text
.git
.env
.env.*
*.pem
*.key
id_rsa*
id_ed25519*
.ssh/
.aws/
.netrc
.npmrc
.pypirc
*.p12
*.pfx
```

### `.dockerignore` baseline: regenerated dependency directories

| Manifest present in the build context | Exclude | Why |
| --- | --- | --- |
| `package.json` (+ any lockfile) | `node_modules/` | Host install may carry macOS/arm64 native bindings the image's Linux/amd64 `RUN npm ci` doesn't produce; copying it in either overwrites what the image just installed or ships a binary that doesn't run there. |
| `composer.json` / `composer.lock` | `vendor/` | Same shape — `RUN composer install` inside the image is the only copy that matches the image's PHP version/extensions. |
| `pyproject.toml` / `requirements*.txt` / `Pipfile` | `.venv/`, `venv/`, `__pycache__/` | A host-created virtualenv embeds absolute host paths and a host-specific Python build; the image's own `uv sync`/`pip install` regenerates it correctly. |

The pattern generalizes: any directory a package manager regenerates from a lockfile/manifest
belongs in `.dockerignore`, because a Dockerfile that installs dependencies is meant to be the
single source of truth for them — the host's copy is at best redundant weight in the build
context, at worst a platform mismatch shipped into the image. Check *which* manifest is actually
present next to the Dockerfile before requiring the matching exclude — don't demand `vendor/` on a
project with no `composer.json`.

### `.dockerignore` baseline: root-level project bookkeeping (deploy image only)

Applies only to a `.dockerignore` next to a **root-level, production/deploy Dockerfile** — not a
`.devcontainer/` image, which never `COPY`s application source in the first place (see the sibling
`devcontainer-dockerfile-best-practices` skill's §2g), so what else sits at the project root barely
matters to its build context. A root Dockerfile that's meant to ship *is* commonly built from a
context that also holds CI config, docs, and editor/tooling dotfiles — none of it belongs in the
image, and unlike the two baselines above, **every entry here is conditional on the path actually
existing** in this project. There's no "preventive" case for excluding a doc folder that will never
exist in this repo — check first, or the file fills up with dead patterns that never match anything.

| Category | Exclude if present |
| --- | --- |
| VCS metadata beyond `.git/` (already in the secret baseline) | `.gitattributes`, `.gitignore`, `.gitlab-ci*.yml` |
| Scratch/log directories | `.temp/`, `temp/`, `.logs/`, `logs/` |
| Dev tooling / CI, not needed to build or run the image | `.cache/`, `.devcontainer/`, `.editorconfig`, `.vscode/` |
| Project bookkeeping & docs | `documentation/`, `test/`, `README.md`/`readme.md` |

The category matters more than the exact names: exclude whatever *this* project's own
tooling/doc/CI conventions put at the root that the shipped image never needs — a project using
`docs/` instead of `documentation/`, or `.github/` workflows instead of `.gitlab-ci*.yml`, gets the
equivalent entry checked the same way, not the literal name from this table. Anything specific to
one org's own repo layout (e.g. a Claude Code config directory, a CI-output directory, a
project-local TODO backlog, a root `CLAUDE.md`) follows the identical rule — check the actual path
that convention uses in this repo before adding it, don't hardcode someone else's tool names into
every project's `.dockerignore`.

Existence alone isn't the bar for any of the three baselines above — a `.dockerignore` that
excludes `node_modules/` but not `.env` still lets a stray `COPY . .` bake a secret straight into a
shipped layer, and one that excludes `.git` but not `node_modules/` on a project with a
`package.json` still risks shipping host-built native bindings. Treat the secret and
dependency-directory baselines as the non-negotiable floor for any `.dockerignore` next to a
Dockerfile whose build context contains application source, and the bookkeeping baseline as the
hygiene layer on top for a root/deploy Dockerfile specifically — checked per path, added only for
what's actually there.

## MUST

- [ ] `# syntax=docker/dockerfile:<pinned-minor>` is line 1.
- [ ] A `.dockerignore` sits next to the Dockerfile **and its content covers both applicable
      baselines** (Reference: `.dockerignore` baselines) — the secret-exclusion baseline always
      applies (`.git`, `.env*`, SSH private keys, cloud/API credential files); the
      dependency-directory baseline applies per ecosystem manifest actually present in the build
      context (`node_modules/` for `package.json`, `vendor/` for `composer.json`, `.venv/`/`venv/`
      /`__pycache__/` for a Python manifest). A file that exists but only excludes generic build
      noise, or omits a directory its own manifest implies, is still a MUST violation — check
      content against what the project actually needs, not just presence.
- [ ] No secret ever travels via `ARG`/`ENV` — both persist in `docker history`. Use
      `--mount=type=secret`/`type=ssh`.
- [ ] Nothing fetched over the network runs unverified: no `RUN curl ... | bash`, no `ADD <url>`.
      Download, checksum/signature-verify, then execute.
- [ ] Layers ordered stable → volatile; no blanket `COPY . .` where scoped `COPY`s would do.
- [ ] `COPY`, not `ADD`, except for genuine local-tarball extraction.
- [ ] One logical step = one `RUN`, cleaned up inside that same instruction — a later separate
      `RUN rm` doesn't shrink an earlier layer, it adds one on top.
- [ ] Every externally-fetched tool version, and the app's `UID`/`GID`, is an `ARG` with a sane
      default — never hardcoded inline.
- [ ] The final `USER` in any shipped stage is non-root (documented exception only for an
      orchestrator that overrides identity at deploy time, e.g. Swarm).
- [ ] When the project uses `uv`, dependency installation resolves from the committed lockfile,
      never from `pyproject.toml`'s open-ended ranges re-resolved live. `uv sync --frozen` is the
      direct case; a subcommand with no `--frozen` of its own still has to hit a lockfile-derived
      artifact one way or another — `uv export --frozen -o requirements.txt` piped into
      `pip install -r`, or `uv tool install --constraints <that same frozen export>` for a
      subcommand (`uv tool install`) that takes constraints instead of a lockfile directly. Check
      the actual resolution source, not the literal command name: `uv pip install -r
      requirements.txt` is fine if that `requirements.txt` was itself `uv export --frozen`'d one
      step earlier in the same Dockerfile, and a bare `uv tool install <path>` with no
      `--constraints`/`--with-requirements` pointed at a frozen export is a MUST violation even
      though it "uses uv."

## SHOULD

- [ ] For a root-level/deploy Dockerfile, `.dockerignore` also excludes whatever project
      bookkeeping/dev-tooling/CI paths actually exist at the project root (Reference:
      `.dockerignore` baseline — root-level project bookkeeping) — checked per path, not a
      hardcoded list applied blindly to every project.
- [ ] `runtime`/`production` is stripped hard (Reference: Stripping runtime/production).
- [ ] CI, and anything multi-platform or cache-sharing, uses `docker buildx build` explicitly.
- [ ] Every `FROM` that ships pins the OS variant, ideally a digest.
- [ ] `COPY --chmod`/`--chown` instead of a follow-up `RUN chmod`/`RUN chown`.
- [ ] Package-manager cache directories use `--mount=type=cache`.
- [ ] OCI labels describe source, version, revision, license.
- [ ] A `HEALTHCHECK` on any long-lived service image.
- [ ] Any Linux-based stage — not exclusively PHP, not shell-less scratch/distroless — sets
      `PYTHONDONTWRITEBYTECODE=1` and `PYTHONUNBUFFERED=1`. Default to setting them rather than
      judging whether the stage "really" runs Python: the cost is two `ENV` lines, so don't
      downgrade a miss to an open question on the grounds that Python usage looks incidental or
      build-time-only.

## MAY

- [ ] `docker buildx bake` to build several related targets (`development` + `production`) from
      one invocation instead of multiple `docker build --target` calls.
- [ ] A hardened runtime base (Chainguard, distroless) swapped into `runtime`/`production`
      specifically, once plain stripping isn't enough — most valuable for a compiled/static binary,
      where it removes the shell entirely.
- [ ] A `production` stage genuinely distinct from `runtime` when they diverge in practice (final
      `CMD`, labels, healthcheck) — for a simple service, collapsing them is fine.
- [ ] Monorepo layout: a shared `base` built once and reused across services'
      (`FROM registry/org/base:<digest>`), each service's `COPY` scoped to its own subdirectory so
      one service's change doesn't invalidate another's cache. BuildKit named contexts
      (`--build-context name=path`) share a layer across Dockerfiles without duplicating
      instructions.
- [ ] Supply-chain attestations: `docker buildx build --provenance=true --sbom=true` emits SLSA
      build provenance and an SBOM — adopt once the MUST/SHOULD items above are already solid.

## Review criteria

Work through these when auditing a Dockerfile, new or existing:

1. Is this stage actually necessary?
2. Can this layer be shared/mutualized with another stage?
3. Does this instruction invalidate the cache unnecessarily?
4. Could this `COPY` be scoped more specifically?
5. Does this package actually belong in the runtime stage?
6. Is this download's integrity verified (checksum/signature)?
7. Should this value be an `ARG` instead of hardcoded?
8. Is this `RUN` conceptually atomic — one logical step, not several unrelated ones bundled
   together, and not needlessly split either?
9. Does this image work under `docker run --read-only`? (Reference: Read-only / tmpfs
   compatibility — its undeclared-writable-path and blanket-`chmod` signals are mechanical
   findings; cache-dir redirection and file-based logging are worth suggesting but need broader
   context; whether the app's own source writes elsewhere stays a genuine open question.)
10. Does this image run without root privileges?
11. Is this Dockerfile deterministic — same input, same image, given the same digests?

## Anti-patterns

**Blanket copy, unmerged install, ownership fixed up after the fact:**

```dockerfile
# ❌
COPY . .
RUN apt update
RUN apt install -y curl
RUN chmod +x /app/entrypoint.sh
RUN chown app:app /app/entrypoint.sh
```

```dockerfile
# ✅
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*
COPY --chmod=755 --chown=app:app app/entrypoint.sh /app/entrypoint.sh
COPY app/ app/
```

**Floating base image:**

```dockerfile
# ❌
FROM python:latest
```

```dockerfile
# ✅
FROM python:3.14.2-slim-bookworm@sha256:…
```

**Secret smuggled through a build arg:**

```dockerfile
# ❌
ARG GITHUB_TOKEN
RUN git clone https://x-access-token:${GITHUB_TOKEN}@github.com/org/repo.git
```

```dockerfile
# ✅
RUN --mount=type=secret,id=github_token \
    TOKEN=$(cat /run/secrets/github_token) && \
    git clone "https://x-access-token:${TOKEN}@github.com/org/repo.git"
```

**Unverified remote script execution:**

```dockerfile
# ❌
RUN curl -sSL https://example.com/install.sh | bash
```

```dockerfile
# ✅
ARG TOOL_VERSION=1.2.3
RUN curl -fL -o tool.tar.gz "https://example.com/tool-${TOOL_VERSION}.tar.gz" \
    && echo "<sha256>  tool.tar.gz" | sha256sum -c - \
    && tar -xzf tool.tar.gz -C /usr/local/bin \
    && rm tool.tar.gz
```

**Fetch/extract/cleanup split across layers:**

```dockerfile
# ❌
RUN wget https://example.com/tool.tar.gz
RUN tar -xzf tool.tar.gz -C /usr/local/bin
RUN rm tool.tar.gz
```

```dockerfile
# ✅
RUN wget -q https://example.com/tool.tar.gz \
    && tar -xzf tool.tar.gz -C /usr/local/bin \
    && rm tool.tar.gz
```

Each separate `RUN` is its own layer — the intermediate `tool.tar.gz` is still present in that
layer's diff even after a later `RUN rm` deletes it from the final filesystem view. Only merging
the three into one `RUN` actually keeps it out of the image.

**Repeated download-verify-install blocks (3+ tools):**

```dockerfile
# ❌ — each block is individually correct (checksummed, one RUN, ARG-pinned) but the shape
# repeats per tool; a 4th tool means a 4th copy-paste
ARG SHFMT_VERSION="3.8.0"
RUN curl -fL -sS -o /usr/local/bin/shfmt "https://…/shfmt_v${SHFMT_VERSION}_linux_amd64" \
    && echo "<sha256>  /usr/local/bin/shfmt" | sha256sum -c - && chmod +x /usr/local/bin/shfmt

ARG FZF_VERSION="0.73.1"
RUN curl -fL -sS -o /tmp/fzf.tar.gz "https://…/fzf-${FZF_VERSION}-linux_amd64.tar.gz" \
    && echo "<sha256>  /tmp/fzf.tar.gz" | sha256sum -c - \
    && tar -xzf /tmp/fzf.tar.gz -C /usr/local/bin fzf && rm /tmp/fzf.tar.gz

ARG HADOLINT_VERSION="2.14.0"
RUN curl -fL -sS -o /usr/local/bin/hadolint "https://…/hadolint-linux-x86_64" \
    && echo "<sha256>  /usr/local/bin/hadolint" | sha256sum -c - && chmod +x /usr/local/bin/hadolint
```

```dockerfile
# ✅ — one config entry per tool, one script; adding a 4th tool is a JSON entry, not a new RUN
COPY --chmod=644 scripts/install-binaries/binaries.json /tmp/binaries.json
COPY --chmod=755 scripts/install-binaries/install-binaries.sh /tmp/install-binaries.sh
RUN /tmp/install-binaries.sh
```

Not a MUST — the repeated version is still checksummed and correct — but a DRY call worth
flagging at 3+ tools fetched the same way. The fix is a centralized downloader script
(`scripts/install-binaries/install-binaries.sh` + `binaries.json`) driven from a
disposable stage — propose it in a TODO, never auto-apply.

**Runtime-writable path baked in with no volume/tmpfs plan:**

```dockerfile
# ❌ — /app/cache is created for the app to write into at runtime, but nothing about the image
# tells a caller it needs to stay writable under `--read-only`, and it isn't declared a VOLUME
RUN mkdir -p /app/cache && chown app:app /app/cache
USER app
CMD ["node", "server.js"]
```

```dockerfile
# ✅ — declared as a VOLUME so the runtime-write intent is explicit; a caller running
# --read-only knows exactly what to mount (a real volume if the cache should survive
# restarts, --tmpfs if it's disposable scratch space)
RUN mkdir -p /app/cache && chown app:app /app/cache
VOLUME /app/cache
USER app
CMD ["node", "server.js"]
```

See Reference: Read-only / tmpfs compatibility for the full signal list (known stateful base
images, runtime cache-dir writes, file-based logging, blanket `chmod -R 777`) — this is the
generic shape of the most common one.
