---
paths:
  - "**/*.md"
  - "**/*.mdx"
---

# Install commands — always apply

Full rationale: `safe-install-commands` skill. Applies the moment an article tells a reader to
install, download or run something on their own machine. The reader copies the **first**
`<Terminal>` in the section and runs it — write for that reader, not the careful one.

- ✅ DO: open the section with a package manager (`brew install …`, `winget install …`). **Check
  availability, don't assume**: `formulae.brew.sh/api/formula/<name>.json`, the `winget-pkgs`
  manifests path, `apt-cache policy` in a throwaway container.
- ✅ DO: offer a verifiable download (`sha256sum -c`, then `gh attestation verify`) before any
  unverifiable one. Prefer the **musl** Linux build over `-gnu`.
- ✅ DO: put `curl … | sh` (and `/bin/bash -c "$(curl …)"`, `iwr … | iex`) **last** in the section,
  with an `<AlertBox variant="danger">` **above** the command naming the concrete risk.
- ❌ DON'T: open an install section with a downloaded-script command, whatever upstream's README does.
- ❌ DON'T: claim interactivity, "read it first", HTTPS/`--proto '=https'`, or a sibling checksum
  as protection — none survive a compromised script. Only signatures, pinned revisions and
  reviewed formulae do.
- ❌ DON'T: leave a version pin unchecked — verify it is still current before publishing.
