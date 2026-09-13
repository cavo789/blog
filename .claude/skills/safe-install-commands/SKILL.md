---
name: safe-install-commands
description: >
  Vet every install or setup command before publishing it in an article. Load when writing
  any section that tells a reader to install, download or run something on their own machine
  — movement 4 of `blog-post-structure`, a Dockerfile shown to readers, a Prerequisite block.
  Enforces the order: look for a packaged alternative first, then a verifiable manual route,
  and only last the risky one-liner, always behind a warning. Triggers on: curl pipe sh,
  install instructions, installation section, setup command, how to install, one-liner,
  installer script, commande d'installation, installer un outil.
---

# Safe install commands

A published install command gets copy-pasted, not read. Assume the reader skims to the first
`<Terminal>` in the section, copies it, and runs it. Everything else on the page — your caveats,
your nuance, the paragraph right underneath — arrives too late.

That single assumption drives every rule below.

## The three-step obligation

Whenever an article tells the reader to install or run something, work down this ladder and stop
at the first rung that exists. Do not skip a rung because upstream's README starts at the bottom.

### 1. A reviewed package manager — look here first

Most tools are packaged, and upstream documentation very often does not say so. **Check, don't
assume.** These are the checks that actually answer the question:

| Source | How to check | What proves support |
| --- | --- | --- |
| Homebrew (macOS **and** Linux/WSL) | `curl -sfL https://formulae.brew.sh/api/formula/<name>.json` | `.versions.stable`, and `x86_64_linux` in `.bottle.stable.files` for WSL |
| winget (Windows) | `curl -sfL https://api.github.com/repos/microsoft/winget-pkgs/contents/manifests/<a>/<Publisher>/<Package>` | directory listing of versions; read the `.installer.yaml` for what it really installs |
| Debian/Ubuntu | `docker run --rm ubuntu:24.04 bash -c 'apt-get update >/dev/null && apt-cache policy <name>'` | empty output means **not packaged** — say so explicitly, readers will go looking |
| Rust tools | `curl -sfL https://crates.io/api/v1/crates/<name>` | `.crate.max_version` — also the fastest way to spot a version pin gone stale |

A package manager is not magic, but it moves the trust question to a public, version-controlled,
pull-request-reviewed formula built by that project's CI — instead of whatever a vendor's domain
returns at the second the reader hits Enter.

### 2. A verifiable manual install — the middle rung

When nothing packages the tool, prefer a release artifact the reader can *verify*:

- Download the binary plus its `.sha256`, check with `sha256sum -c`.
- Then check **provenance**, which is the part that actually matters. Many GitHub projects now
  publish SLSA attestations without advertising it:

  ```bash
  # 200 means an attestation exists for this exact artifact
  curl -sfL -o /dev/null -w '%{http_code}\n' \
    "https://api.github.com/repos/<owner>/<repo>/attestations/sha256:<digest>"

  gh attestation verify <file> --repo <owner>/<repo>
  ```

- Prefer the **musl** build over `-gnu` when offering a Linux binary: it is statically linked and
  runs anywhere, while `-gnu` fails with `GLIBC_2.xx not found` on older distributions.

### 3. The risky one-liner — last, and never bare

If it is genuinely the only route, publish it **last in the section**, never as the opening
command, and always with the warning *above* it.

## Patterns that must trigger this skill

- `curl … | sh`, `… | bash`, `wget -O- … | sh`
- `/bin/bash -c "$(curl …)"` — the same thing wearing a hat
- PowerShell `iwr … | iex`
- piping anything into `sudo sh`
- `chmod +x` on a freshly downloaded binary, then running it
- `docker run` with `--privileged`, `-v /var/run/docker.sock:…`, or `-v /:/host`

## Arguments that are NOT security controls

This is the part that is easy to get wrong, and getting it wrong is worse than saying nothing,
because it manufactures false confidence. None of the following protect against a **compromised**
script — they only protect against a *legitimate* script surprising you:

| Tempting claim | Why it fails |
| --- | --- |
| "The installer is interactive, it asks you to confirm" | The compromised script prints the confirmation prompt too. |
| "You can read the script before running it" | You read the copy served to you; the next fetch can differ. |
| "It is HTTPS", `--proto '=https' --tlsv1.2` | Secures the *transport*. Says nothing about the content. |
| "There is a checksum next to the download" | Same server serves both. Whoever swaps one swaps the other. |

What does count: a **signature or attestation** verified against a public transparency log, a
**pinned immutable revision** (a commit SHA, a digest), or a **reviewed package manager formula**.

If a bootstrap is itself a `curl | sh` (Homebrew's own is), say so plainly rather than papering
over it, and give what genuinely helps: pin the revision, and prefer a signed installer where the
project publishes one.

## Where the research goes

Vetting an install command means real digging: release assets, formula APIs, manifests,
attestation endpoints. **That research does not belong in the article.** The reader needs the
command to type and one sentence on why this route over another; everything else belongs in the
shipped file's header comment, or back in this skill.

The failure mode is subtle because the material is genuinely good — it just costs the reader a
chapter they did not ask for. Observed repeatedly on one article: a four-paragraph aside on
bootstrapping the package manager, a full `gh attestation verify` walkthrough requiring two extra
tools, and a chapter on the demo's own plumbing. All three were cut after review; none were
missed. If a finding feels too valuable to drop, that is the signal to put it **here**, not there.

## After moving a command, re-read what stayed behind

Demoting a risky command to the end of a section orphans every paragraph written as a reply to
it. "What did that buy you? The trust question moves from *a script served by a domain I have
never looked at*…" reads fine above the command and is incomprehensible when the command now sits
three screens below and the reader has never seen it.

Demoting the risky command is the most common trigger, which is why it is named here — but the
sweep itself belongs to `blog-post-structure` → *After any restructuring, sweep the whole
article*, which owns the grep patterns and covers the downstream and deleted-block cases too.
Run it over the **whole file**, not just the install section.

## Placement rules

1. **Safest first, riskiest last.** The reader copies the first `<Terminal>` in the section.
2. **The warning goes above the command**, never below it — use `<AlertBox variant="danger">`.
3. Say what the danger concretely is: *if `<domain>` is compromised, whatever the attacker left
   there runs on your machine the moment you press Enter.* Not "be careful".
4. Point at the alternative from inside the warning, so the escape route is one line away.
5. Collapse the long verifiable route into `<Details label="…">` so it never blocks the reader
   who just wants the package manager command.

## Self-check

1. Does the install section **open** with a package manager command, not a downloaded script?
2. Did you actually run the availability checks in step 1, or assume?
3. Is every `curl | sh`-shaped command preceded by an `<AlertBox variant="danger">`?
4. Does any warning claim interactivity, readability, HTTPS or a bare checksum as protection?
5. Is the riskiest option last in the section?
6. Did any of the research above leak into the article instead of the skill or the file header?
7. After a reorder, does every paragraph still make sense to a reader who has not met the
   command yet?
8. Are pinned versions still current? (`crates.io` / releases API — a stale pin in a
   security section reads as carelessness.)
