---
name: docker-image-slimming
description: Methodology for shrinking a Docker image using `dive` — obtaining the binary without sudo, running it non-interactively via `-j/--json`, the verified JSON schema (per-layer size/command, image-level wasted-file ledger), and the three-bucket classification (auto-fix mechanical waste, propose heavy-tool-for-narrow-need swaps for joint review, TODO everything else). Project-agnostic; a project command binds which Dockerfile(s)/image(s) to analyze and how to build them. Internal methodology — invoke via `/docker-dive-optimization`, not directly.
disable-model-invocation: false
---

# Docker Image Slimming — methodology (dive)

Generic and reusable. Uses [dive](https://github.com/wagoodman/dive) to find where a Docker image's
bytes actually go, then classifies findings into what's safe to fix mechanically versus what needs a
human judgment call. A project's own command binds this to concrete Dockerfile(s)/image tag(s) and
however that project builds them.

## Getting dive without touching the system

Never install system-wide (`apt install dive`, `brew install dive`) for what is a one-off analysis —
download the portable binary into the session's scratch directory and run it from there; nothing to
clean up, nothing left on `PATH`.

1. Resolve a version: `curl -sI https://github.com/wagoodman/dive/releases/latest` and read the
   `location` header (redirects to `.../releases/tag/vX.Y.Z`) — unless the project pins a version.
2. Map `uname -m` to dive's arch naming: `x86_64` → `amd64`, `aarch64` → `arm64`.
3. Download both the archive and its checksums from the same release, then verify before extracting:
   `dive_<version>_linux_<arch>.tar.gz` and `dive_<version>_checksums.txt` (exact asset names —
   confirmed against a real release; there is no bare `checksums.txt`). `grep` the archive's line out
   of the checksums file and check it with `sha256sum -c`.
4. Extract just the `dive` binary into the scratchpad and invoke it by full path. It does not need to
   survive past this session.

## Running it non-interactively

- `dive <image-tag> -j <output.json>` — the `-j`/`--json` flag **by itself** skips the interactive TUI
  (confirmed via `dive --help`; the separate `--ci` flag is a pass/fail gate against a
  `.dive-ci`/`--ci-config` threshold file, not required just to get the JSON).
- dive reads from the **local engine** by default (`--source docker`, also `podman`/`docker-archive`)
  — not a registry reference. The image must already be built and tagged locally before running dive.

## Verified JSON schema

Hand-verified against a real `dive --json` run on a controlled 5-layer test image (one plain `apk
add`, one heavy `apk add nodejs npm && npm install -g cspell`, one layer writing a 5 MB scratch file,
one later layer deleting it) — this is not from dive's docs, which don't document the schema:

```json
{
  "layer": [
    {
      "index": 0,
      "id": "blobs",
      "digestId": "sha256:...",
      "sizeBytes": 7802737,
      "command": "ADD alpine-minirootfs-3.20.10-x86_64.tar.gz / # buildkit",
      "fileList": [ { "path": "bin/busybox", "size": 808712, "isDir": false, "...": "..." } ]
    }
  ],
  "image": {
    "sizeBytes": 112810485,
    "inefficientBytes": 5908279,
    "efficiencyScore": 0.9497748015177845,
    "fileReference": [
      { "count": 2, "sizeBytes": 5242880, "file": "/tmp/junk" }
    ]
  }
}
```

Two facts drive the entire analysis:

- **`layer[].command` is the literal Dockerfile instruction** — `RUN /bin/sh -c <exact command> #
  buildkit`. Strip the `/bin/sh -c ` prefix and the ` # buildkit` suffix; what remains matches the
  Dockerfile source closely enough to `grep -F` for it directly. No fuzzy matching, no line-number
  guessing needed to map a heavy layer back to its instruction.
- **`image.fileReference` is dive's own wasted-bytes ledger** — any path present in more than one
  layer (`count > 1`), i.e. created in one layer and then modified or deleted in a later one. This
  *is* the "should these layers be merged / should this cache be cleaned in the same RUN" signal,
  already computed by dive — don't re-derive it from `fileList` diffs.

`fileList` is unbounded (every file in every layer) — never dump it whole; `jq` for the specific
paths a bucket below needs (mainly: matching Bucket A's cache-path patterns).

## Three-bucket classification

Same three-tier shape as this project's Dockerfile best-practices review: mechanical fixes land
directly, judgment calls get proposed and wait for a decision, the rest becomes a TODO.

### Bucket A — auto-apply now, mechanical, zero judgment

- A `fileReference` entry whose `file` matches a known package-manager cache/list path — apt
  (`/var/lib/apt/lists/*`, `/var/cache/apt/*`), apk (`/var/cache/apk/*`), pip (`*/.cache/pip/*`), npm
  (`*/.npm/*`), yarn cache — with `count > 1` across layers. This is the classic "installed in one
  `RUN`, cache purged in a separate later `RUN`" split: the bytes are already committed to the image
  by the time the cleanup layer runs. Fix: merge the offending `RUN` instructions into one, so the
  purge happens in the *same* layer as the install (`&& rm -rf /var/lib/apt/lists/*`, `--no-cache-dir`
  for pip, `--no-cache` for apk, etc.).
- Any `fileReference` entry for a plain scratch/temp file written in one `RUN` and removed in a later
  one, with no package manager involved at all (the `/tmp/junk` case above) — same fix: write and
  clean up inside one `RUN`, don't leave the fossil in an earlier layer.
- A layer's `command` runs a package manager without its cache-disabling flag, even if dive didn't
  flag bytes for it (a small image can stay under a wasted-byte threshold while still carrying an
  avoidable cache) — `pip install` without `--no-cache-dir`, `apt-get install` without a same-`RUN`
  `rm -rf /var/lib/apt/lists/*`, `npm install`/`ci` without `--no-cache` plus a purge. Apply directly.

Map each finding back to its source line with the `command` field (see schema section above), apply
with `Edit`, and state per file which merges/flags landed.

### Bucket B — propose, decide together

Never auto-apply these — they change what the image *does* or *contains*, not just how it's built:

- **Heavy ecosystem for a narrow need** — a layer whose `command` installs a large runtime/toolchain
  (Node/npm, a JDK, the .NET SDK, Ruby+gems, Go, GHC/cabal, a full-size Python vs. a slim base) whose
  `sizeBytes` is disproportionate to what it visibly buys (say, dominating the image's `sizeBytes`
  while installing only one or two narrow CLI tools afterward). Before proposing anything, check
  whether that runtime is actually used elsewhere in the file or the project (`grep` other stages,
  scripts, docs) — removing it blind can break something the layer wasn't obviously there for. Present
  the finding with dive's numbers (layer size, % of image) plus a concrete alternative — a standalone
  static binary release of the same tool, an already-present interpreter that can run an equivalent,
  moving the install into a discarded builder stage — and stop for a decision.
- **Multi-stage opportunity** — a heavy toolchain used only to produce an artifact (compile, bundle,
  generate) that could live in a `FROM ... AS builder` stage, with only the produced artifact copied
  into the final stage via `COPY --from=builder`.
- **Base image swap** — a `-slim`/`-alpine`/distroless variant of the same base exists. Flag it, don't
  swap it: a libc change (glibc → musl) or a missing shell/package manager can break things a size
  diff alone won't reveal.

### Bucket C — everything else → TODO

Every other dive finding that isn't mechanical and isn't a Bucket B judgment call worth a live
back-and-forth (e.g., a wasted-byte contributor with no clear single fix, an efficiency-score
regression with an unclear cause). File it — the binding command decides the authoring contract and
batch key.

## Verify the fix

After applying Bucket A, rebuild the image and re-run dive. Report `image.sizeBytes` and
`image.efficiencyScore` before vs. after. A Bucket A edit that doesn't measurably shrink the image or
raise the efficiency score means the classification was wrong, not that the job is done — don't
report success on the strength of the edit alone.
