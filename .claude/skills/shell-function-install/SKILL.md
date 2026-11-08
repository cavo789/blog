---
name: shell-function-install
description: >
  House pattern for publishing a reusable shell function (a command the reader will call from
  any folder) in an article: one standalone file in ~/.zsh/fns/ or ~/.bash/fns/, a zsh/bash
  <Tabs> pair with a <ProjectSetup> per shell, the `for fn_file …` loader, then "open a new
  terminal". If the function wraps a Docker image, its Dockerfile lives in ~/tools/<tool>/ and
  the function explains how to rebuild when the image is missing. Load when an article gives
  the reader a function, an alias or a wrapper script to keep. Triggers on: shell function,
  alias, wrapper, .bashrc, .zshrc, ~/.zsh/fns, reusable command, docker run wrapper, global
  command, fonction réutilisable, alias bash, alias zsh.
---

# Shell function install

Reference implementation: `blog/2026/11/09/duckdb-json-csv/` (section *Make `duckdb` Available
Everywhere*, file `files/duckdb.sh`). Read it before writing a new one.

## The rules

1. **One function, one file.** Never "paste this into your `~/.bashrc`". The file goes in
   `~/.zsh/fns/<name>.zsh` (zsh) or `~/.bash/fns/<name>.sh` (bash). The rc file only holds the
   loader loop; removing the tool is deleting one file. Link
   `<Link to="/blog/modular-zsh-workflow">` for the rationale, don't re-explain it.
2. **Both shells, one source file.** Write the function so it runs unchanged in bash and zsh, and
   show the same `./files/<name>.sh` under both filenames. Portable means: `local`, `[[ ]]`,
   `printf` (not `echo -e`), `"$@"`; arrays only as `local -a a=()` + `"${a[@]}"` (never
   index them: bash counts from 0, zsh from 1); no `print -z`, no `read -q`, no zsh glob
   qualifiers, no `${(…)}` flags, no `${PIPESTATUS[@]}` (zsh: `$pipestatus`), no `${var,,}`.
   **Never** `exec`, `exit`, `set -e`/`set -u` or a nested helper function in the body: the
   function runs inside the reader's shell, so each of those closes their terminal, changes
   their shell options, or leaks a global.
   Verify with `shellcheck -s bash` (via `docker run -i koalaman/shellcheck:stable -s bash - <
   file`, stdin, never a bind mount) **and** a real run in **both** shells: an `alpine` container
   with `apk add zsh bash docker-cli`, the Docker socket, and the repo mounted at its **host**
   path (`-v $HP:$HP -w $HP`, so `$PWD` means the same thing for the daemon), loading the files
   through the exact loaders below with a temporary `HOME`.
   - **A long script** (a hundred lines, bash-only features, its own `exit` codes) stays a
     script: it lives in `~/tools/<tool>/` next to the Dockerfile, and the function only checks
     prerequisites then runs `bash ~/tools/<tool>/<script>.sh "$@"`. Reference: `docling`
     (`files/docling-convert.sh` + `files/docling-convert.fn.sh`).
   - The function **cannot** be portable (the Ollama `ai-*` series relies on `print -z`, zsh
     arrays…)? Then publish the zsh tab only, without `<Tabs>`, and say once, flatly, that the
     function is zsh-only. Don't fake a bash tab.
3. **A `<Tabs groupId="shell">` pair**, zsh first and `default`. `groupId="shell"` keeps the
   reader's choice across every article. Each tab has the same three numbered steps:
   - **1. Create the file** — a `<ProjectSetup folderName="~/.zsh/fns">` (resp. `~/.bash/fns`)
     holding the single `<Snippet>`, so the reader gets the copy/paste script and the ZIP.
   - **2. Load the folder** — the loader loop below, with "already done if you followed an
     earlier article" on the zsh side (the `ai-*` series installed it), linked to the series
     page: `<Link to="/series/ollama-daily-use">"Ollama daily use"</Link>`. Every cross-reference
     to another article or series in the install block is a `<Link>`, never plain text.
   - **3. Open a new terminal** (or `exec zsh` / `exec bash`). Never skip this step: it's the one
     readers forget, and "command not found" right after installing is the result.
   After the tabs: one check line, `type <name>` must answer `<name> is a shell function`.
4. **Show the code once, readable**, above the tabs: `<Snippet filename="<name>.sh"
   source="./files/<name>.sh" defaultOpen={true} />`. The snippets inside the `ProjectSetup`s
   stay `defaultOpen={false}`.

### The loaders (copy exactly)

```zsh title="~/.zshrc"
for fn_file in ~/.zsh/fns/*.zsh; do
  source "$fn_file"
done
```

```bash title="~/.bashrc"
for fn_file in ~/.bash/fns/*.sh; do
  [[ -r "$fn_file" ]] && source "$fn_file"
done
```

The `-r` test is there because bash leaves an unmatched glob literal: an empty folder would
otherwise print an error at every shell start. The zsh loop is the one already published across
the `ai-*` series; keep it identical so readers recognize it.

## When the function wraps a Docker image

A **public image** pulled as-is (`mikefarah/yq:4`) needs none of the below except the `docker`
check: Docker pulls it on first use, there is nothing to rebuild. Reference: `linux-yq`.

- **The Dockerfile has a permanent home: `~/tools/<tool>/`** (e.g. `~/tools/duckdb`). A
  `/tmp/<demo>` folder is fine for the "try it in two minutes" `ProjectSetup` with demo files,
  never as the place the reader rebuilds from. Show the move explicitly:

  ```bash
  mkdir -p ~/tools/<tool>
  cp /tmp/<demo>/Dockerfile ~/tools/<tool>/
  docker build -t <image> ~/tools/<tool>
  ```

- **The function checks before running**, and every error ends with a "How to continue" list,
  on stderr, `return 1`:
  - `command -v docker` missing → say so;
  - `docker image inspect <image>` fails → if `~/tools/<tool>/Dockerfile` exists, print the exact
    `docker build` command; otherwise point to the article URL to get the Dockerfile back, then
    the build command. Test **both** branches for real (rename the image with `docker tag` +
    `docker rmi`, restore it after).
- **`docker run` defaults**: `--rm`, `-v "${PWD}:/workspace" -w /workspace` (the current folder
  is the scope; say so in the article), `-u "$(id -u):$(id -g)"`, `--read-only` + a `--tmpfs
  /tmp`, `--cap-drop ALL`, `--security-opt no-new-privileges:true`. Use `-it` only when
  `[[ -t 0 && -t 1 ]]`, otherwise `-i`, so piping in and out keeps working.
- **`--read-only` does not protect the reader's files**: it locks the container's own filesystem,
  a `-v` mount stays writable. When the tool only *needs* to read (a query engine, a viewer),
  mount `"${PWD}:/workspace:ro"` by default and lift it with an opt-in first argument
  (`duckdb --write`): print a one-line notice when the interactive mode starts, and a tip on a
  non-zero exit. The exit code goes into `rc`, never `status` (read-only special in zsh).
  Reference: `duckdb-json-csv`.
- Naming the function after the tool (`duckdb`) shadows a native install: one `caution`
  AlertBox, once.
- Paths in the messages are printed **literally** as `"${HOME}/tools/<tool>"`: a
  `build_dir_shown='${HOME}/tools/<tool>'` (single quotes, `# shellcheck disable=SC2016`) next
  to the real `build_dir`, used only in `printf`. The reader can paste the line as is, in any
  shell, for any user. Never `"~/…"` (no tilde expansion inside quotes), never an expanded
  `/home/<someone>/…` (a placeholder gets copied verbatim). The article shows the message as a
  `text` block, identical to the terminal.

## Coexisting with the zsh autoload model

<Link to="/blog/modular-zsh-workflow"> and `fzf-ripgrep` (`rgf`) use zsh **autoload**: an
extensionless file holding the function *body*, found through `fpath`. Bash has no equivalent,
so those two articles stay zsh-only until the author decides otherwise; don't migrate them
silently. Both models share `~/.zsh/fns/`: the `for fn_file … *.zsh` loop never picks up an
extensionless file, so they don't collide.

## Migrating an older article

- Turn the script into a function: drop the shebang, `set -euo pipefail` and `exec`.
- Remove the old install path from the reader's machine in one `note` AlertBox ("Coming from the
  previous version of this article?" + `sudo rm /usr/local/bin/<name>`).
- Add an `updates:` entry to the front matter, dated, one sentence.
- Check the slug before writing a URL into a file: folder ≠ slug happens (`ssh_with_fzf` →
  `/blog/ssh-with-fuzzy-finder`).
- A file deleted from `files/` breaks the **`fr` build** until the article is retranslated:
  the French copy still references it. Retranslate in the same change.

## Checklist before handing over

- [ ] `files/<name>.sh` is the only source; both tabs point to it.
- [ ] shellcheck clean; real run under zsh **and** bash, through the loaders, temporary `HOME`.
- [ ] Docker: both "image missing" branches tested; Dockerfile path is `~/tools/<tool>`.
- [ ] Each tab: steps 1 (`ProjectSetup`) / 2 (loader) / 3 (new terminal); `type <name>` check after.
- [ ] Isolated build passes (`DOCUSAURUS_GENERATED_FILES_DIR_NAME=.docusaurus-verify`), tabs render.
