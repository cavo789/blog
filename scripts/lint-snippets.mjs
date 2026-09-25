#!/usr/bin/env node
/**
 * Lint the ~1000 code files this blog publishes under `blog/**‍/files/`.
 *
 * `check-snippet-sources.mjs` proves a `<Snippet source="…">` still *resolves*; nothing until
 * now proved the file it resolves to is *correct*. Those files are what readers copy-paste, and
 * `quality.yml` only ever checked the site's own code — so a `docker-compose` v1 invocation or
 * an `apt-key add` published in 2023 stays copy-pasted for years. See TODO 0132.
 *
 * ## Why this does not just run shellcheck over the tree
 *
 * These files are article extracts, deliberately incomplete: 81 carry a `.partN` fragment
 * suffix, 152 carry `%%name=value%%` placeholders, 90 carry Docusaurus highlight directives, and
 * dozens are zsh helper functions with no shebang meant to be sourced. Pointed at the raw tree a
 * linter reports hundreds of diagnostics that are false *only because the file is an extract* —
 * which is exactly why this lint had never been written. Three mechanisms make it honest:
 *
 *   1. `lib/snippet-lint-normalize.mjs` reduces the two authoring conventions away, in memory.
 *      **No file under blog/ is ever written to** (acceptance criterion 6).
 *   2. `lib/snippet-lint-dispatch.mjs` claims a file only when its type is unambiguous, and
 *      reports everything else as UNSUPPORTED rather than guessing.
 *   3. Each adapter below suppresses the diagnostic classes that are structurally meaningless on
 *      an extract (an unassigned variable, a missing shebang) while keeping the ones that stay
 *      true regardless of context (a syntax error, a deprecated flag).
 *
 * ## State, and why a single file rather than 1000 sidecars
 *
 * `.snippet-lint.json` at the repository root holds path → hash → verdict for **every** scanned
 * file, UNSUPPORTED ones included, plus the `excluded` map. The sidecar shape used by ELI5 and
 * questions was considered and rejected for two reasons: it would add ~1000 files to the repo,
 * and, more importantly, the ELI5 `{"excluded": true}` marker already means "this snippet needs
 * no plain-English annotation" — a different refusal from "this snippet cannot be linted". A
 * fragment can deserve one and not the other.
 *
 * The single file also closes the 2026-09-18 trap recorded in CLAUDE.md: *a sidecar that does
 * not exist appears in no `git ls-files` listing*, which is how two articles shipped
 * un-annotated through every pre-commit run. Coverage here is a set difference between this
 * file's keys and the corpus scan, so a file that was never analysed cannot hide.
 *
 * ## Warning policy (TODO 0138, revised by TODO 0139)
 *
 * The gate is **blocking on `error` severity** -- that is what `quality.yml` runs, and TODO 0138
 * made it true by fixing the 6 real errors of the first reference run.
 *
 * TODO 0139 then went after the warnings, and its result is worth stating plainly because the
 * estimate it started from was wrong. 0138 had sorted the 276 published warnings into "156
 * fixable, 78 version pinning, 42 false positives", but the 156 was obtained by *elimination* --
 * by removing the classes already known to be bad, not by checking the rest. Checking the rest
 * overturned it. **54 of the 156 were genuinely worth fixing and are fixed; 102 are not**, for
 * per-class reasons verified one by one:
 *
 *   1. **Fixed (54, six codes driven to zero).** `DL3015` x24 (`--no-install-recommends`),
 *      `SC2004` x10 (`$` inside `$(( ))`), `SC2164` x4 (an unguarded `pushd`), `SC2102` x4
 *      (`fastapi[standard]` unquoted is a shell glob), `DL3019` x4 (`apk add --no-cache`),
 *      `DL3009` x3 (apt lists left in the image), `SC2086` x2, `SC2028` x1 (a LightDM `.conf`
 *      written with `echo`, which only worked because Docker's default `/bin/sh` is dash),
 *      `SC2269` x1 (a dead self-assignment), `DL3027` x1 (`apt` -> `apt-get`). The six codes now
 *      at zero are ratcheted -- see `RATCHETED_CODES` below.
 *
 *   2. **Refused: the literal text is the point (25).** `SC2028` x15 is almost entirely the
 *      `RUN echo "PS1='\n\e[0;33m...\w # '" >> .bashrc` line repeated across the demo images:
 *      those backslash sequences are written *literally* into `.bashrc`, where **bash's own
 *      prompt expansion** interprets `\n`, `\e` and `\w` at prompt time, and `\$(whoami)` must
 *      stay unexpanded to re-evaluate on every prompt. `printf` would expand them at build time
 *      and break the prompt. `SC2016` x10 is the same mistake in reverse: every hit is a
 *      `printf '%s\n'` block writing a **shell function** into a config file, where `$1` and
 *      `${var}` must survive as text. Single quotes are correct; "fixing" this would break every
 *      zsh helper in the corpus.
 *
 *   3. **Refused: the fix degrades the article (29).** `DL3059` x18 (merge consecutive `RUN`) --
 *      each `RUN` in these files is one teaching step under its own comment, and layer count is
 *      irrelevant for an image nobody deploys; merging also renumbers every ELI5 anchor.
 *      `DL3003` x6 (`cd` -> `WORKDIR`) -- `WORKDIR` persists for every later instruction, so this
 *      is a semantic change, not a cleanup. `SC2015` x5 (`A && B || C`) -- the compact
 *      default-assignment idiom in an article whose subject *is* that idiom.
 *
 *   4. **Refused: renumbers for no reader benefit (12).** `DL4006` needs a `SHELL` line added
 *      above the `RUN`, shifting every ELI5 anchor below it, to guard a pipe in a demo build.
 *
 *   5. **Excluded, not fixed (9 warnings, 1 file).** `ollama-installation/calculate_autocompleted.sh`
 *      is raw LLM output: the article states the script was produced *entirely* by accepting
 *      Ollama's suggestions, so its warnings are the evidence. Correcting them would falsify the
 *      demonstration -- exactly the `vscode-tabnine/customer.php` case already in `excluded`.
 *
 *   6. **The long tail (36).** `DL3046`, `DL3060`, `DL3016`, `SC2174`, `DL4001`, `DL3045` and 15
 *      singletons. Individually marginal on an article extract; left visible rather than silenced.
 *
 * The two classes 0138 had already refused stand unchanged, and are the reason a linter's advice
 * cannot be applied wholesale to a tutorial:
 *
 *   - **Version pinning (78).** `DL3008` (apt, 48), `DL3007` (`latest`, 12), `DL3013` (pip, 9),
 *     `DL3018` (apk, 9). Correct for a production image, actively wrong for a published tutorial:
 *     a pinned `apt-get install pkg=1.2.3` disappears from the Debian mirror within months and the
 *     reader's build then fails with `Version '1.2.3' for 'pkg' was not found` -- strictly worse
 *     than the unpinned line it replaced. An article's Dockerfile is read, not deployed.
 *   - **Nothing to correct (42).** `DL3064` (31) fires on hadolint's name heuristic, and every hit
 *     is an `ARG OS_USERNAME=quarto` / `ARG USERNAME=johndoe` -- the devcontainer user name this
 *     blog teaches, not a secret. `DL3066` (11) fires on `USER node` / `USER www-data` /
 *     `USER root`, where a numeric UID would obscure the very line the article explains.
 *
 * Corpus total: **276 -> 223 published warnings, 0 errors.** Anything still listed above is there
 * on purpose. Before "fixing" a class, read why it was refused: two of them would break working
 * demos, and one would falsify an article's central claim.
 *
 * Touching any file under `blog/**‍/files/` stales its ELI5 sidecars in **both** locales --
 * the `sourceHash` covers the whole file, so even a same-line edit counts -- and a fix that adds
 * or removes a line also shifts the line-keyed `explanations` anchors. Regenerate with
 * `eli5 <file> --force` and `--locale fr`, never by rewriting a hash. Budget ~0.01 $ per sidecar
 * (`lib/i18n-eligibility.mjs`); TODO 0139's 41 touched files cost 78 regenerations.
 *
 * ## Usage
 *
 *   node scripts/lint-snippets.mjs                  # incremental run over blog/ + .unpublished/
 *   node scripts/lint-snippets.mjs --force          # re-lint everything, ignore stored hashes
 *   node scripts/lint-snippets.mjs --only <path>    # one file or one path prefix
 *   node scripts/lint-snippets.mjs --ci             # published articles only; exit 1 on error
 *   node scripts/lint-snippets.mjs --stats          # coverage table, no linting
 *   node scripts/lint-snippets.mjs --judge          # + pass 2, the obsolescence judge (slow)
 *   node scripts/lint-snippets.mjs --judge-only     # pass 2 alone, skip the containers
 *   node scripts/lint-snippets.mjs --exclude <path> --reason "why"
 *   node scripts/lint-snippets.mjs --unexclude <path>
 *
 * Exits 1 when an error-severity diagnostic survives on a non-excluded file, 0 otherwise.
 */

import fs from "node:fs";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { scanSnippetTags } from "./lib/snippet-scan.mjs";
import { hashSource } from "./lib/eli5-hash.mjs";
import { normalizeSnippet } from "./lib/snippet-lint-normalize.mjs";
import { dispatchSnippet, LANGUAGES } from "./lib/snippet-lint-dispatch.mjs";
import {
  JUDGE_MODEL,
  JUDGE_PROMPT_VERSION,
  judgeDisabled,
  judgeReachable,
  judgeSnippet,
} from "./lib/snippet-lint-judge.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const STATE_PATH = path.join(projectRoot, ".snippet-lint.json");
const STATE_VERSION = 1;

/**
 * Linters run in containers rather than being installed in the devcontainer: the image stays
 * slim, and CI needs no extra setup step. Every invocation feeds the normalised text on **stdin**
 * — never a bind mount — because this repo runs docker-outside-of-docker, where `-v` resolves
 * paths against the *host* filesystem and would silently mount nothing (see the DooD trap in
 * CLAUDE.md's sibling notes). Measured overhead: ~0.31 s per invocation.
 */
const IMAGES = {
  shellcheck: "koalaman/shellcheck:stable",
  hadolint: "hadolint/hadolint:latest-alpine",
  yamllint: "cytopia/yamllint:latest",
  // The apache variant, not `php:8.4-cli`: it ships the same CLI binary and is already present
  // in this project's image cache, so a first run pulls nothing.
  "php-l": "php:8.4-apache",
  ruff: "ghcr.io/astral-sh/ruff:latest",
};

/** How many linter containers to keep in flight. Beyond ~8 the daemon, not the CPU, is the limit. */
const CONCURRENCY = 8;

/**
 * The ratchet (TODO 0139). Each code here was driven to **zero** across the whole published
 * corpus, so it is promoted from warning to error: reintroducing one fails `--ci`, and the class
 * can never silently refill. Add a code the day you empty it -- never before, because a single
 * surviving occurrence would turn every run red.
 *
 * Why these six and not the rest: they are the codes where the linter and the reader agree.
 * `fastapi[standard]` unquoted is a glob the shell may expand (SC2102); `apk update && apk add`
 * leaves a package index in the image (DL3019); an `apt-get install` with no `rm -rf
 * /var/lib/apt/lists/*` does the same (DL3009); `$(($n + 1))` and a self-assignment are simply
 * noise in a script a reader copies (SC2004, SC2269); and `apt` has no stable CLI interface, so
 * a Dockerfile wants `apt-get` (DL3027). Fixing them improved the article.
 *
 * `DL3015` (`--no-install-recommends`) was fixed 24 times but is **deliberately not here**: two
 * occurrences must survive, and both would break if "corrected" --
 * `docker-lubuntu` installs the `lubuntu-desktop` metapackage, which pulls the desktop through
 * Recommends, and `docker-run-linux-gui` installs a local `google-chrome*.deb`, whose runtime
 * dependencies are Recommends too. See the warning policy above for the classes refused wholesale.
 */
const RATCHETED_CODES = new Set([
  "SC2102",
  "DL3019",
  "DL3009",
  "SC2004",
  "SC2269",
  "DL3027",
]);

// ---------------------------------------------------------------------------- CLI

const argv = process.argv.slice(2);
const hasFlag = (f) => argv.includes(f);
const flagValue = (f) => {
  const i = argv.indexOf(f);
  return i === -1 ? null : (argv[i + 1] ?? null);
};

if (hasFlag("--help") || hasFlag("-h")) {
  console.log(`
Usage: node scripts/lint-snippets.mjs [options]

Pass 1 — linters (fast, blocking on \`error\`):
  (no option)          incremental run over blog/ + .unpublished/
  --only <path>        one file or one path prefix
  --force              re-lint everything, ignore stored hashes
  --ci                 published articles only; exit 1 on error
  --stats              coverage table per file type, lints nothing

Pass 2 — the obsolescence judge (slow, advisory, never blocking):
  --judge              run it after the linters
  --judge-only         run it alone, opening no container
  --judge-limit <n>    stop after n files — the run is resumable
  Needs Ollama. Skipped under CI or OLLAMA_DISABLE=1.

Triage:
  --exclude <path> --reason "why"     stop linting one file, on the record
  --unexclude <path>                  put it back

Other:
  --json               machine-readable findings
  --quiet              no progress output
  --help, -h           this screen

State lives in .snippet-lint.json: one key per referenced file, a separate \`judge\` key per
file for pass 2, plus the hand-written \`excluded\` triage. The two passes carry their own
hashes, so re-running one never re-analyses the other.
`);
  process.exit(0);
}

const options = {
  force: hasFlag("--force"),
  quiet: hasFlag("--quiet"),
  json: hasFlag("--json"),
  ci: hasFlag("--ci"),
  stats: hasFlag("--stats"),
  judge: hasFlag("--judge"),
  judgeOnly: hasFlag("--judge-only"),
  judgeLimit: flagValue("--judge-limit"),
  only: flagValue("--only"),
  exclude: flagValue("--exclude"),
  unexclude: flagValue("--unexclude"),
  reason: flagValue("--reason"),
};

// ---------------------------------------------------------------------------- state

function loadState() {
  if (!fs.existsSync(STATE_PATH)) {
    return { version: STATE_VERSION, generatedAt: null, excluded: {}, files: {} };
  }
  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(STATE_PATH, "utf-8"));
  } catch (err) {
    // Unreachable through this script's own writes (see saveState), but a bad merge conflict
    // resolution reaches it — and silently starting from an empty state would discard the
    // `excluded` triage without a word.
    console.error(
      `${STATE_PATH} is not readable JSON (${err.message}).\n` +
        `Restore it from git (git checkout -- .snippet-lint.json) rather than deleting it: it ` +
        `carries the hand-written \`excluded\` triage, which no re-run can reconstruct.`,
    );
    process.exit(2);
  }
  if (parsed.version !== STATE_VERSION) {
    // A schema bump invalidates stored verdicts, never the author's triage decisions.
    return {
      version: STATE_VERSION,
      generatedAt: null,
      excluded: parsed.excluded ?? {},
      files: {},
    };
  }
  return parsed;
}

function saveState(state) {
  state.generatedAt = new Date().toISOString();
  const ordered = {
    version: state.version,
    generatedAt: state.generatedAt,
    excluded: Object.fromEntries(
      Object.entries(state.excluded).sort(([a], [b]) => a.localeCompare(b)),
    ),
    files: Object.fromEntries(
      Object.entries(state.files).sort(([a], [b]) => a.localeCompare(b)),
    ),
  };
  // Written to a temporary file and renamed into place, never straight onto STATE_PATH.
  //
  // `rename(2)` within one filesystem is atomic: a reader sees either the whole previous file or
  // the whole new one, never a half-written JSON. That matters here because the judge pass
  // (TODO 0137) calls this after **every** file — ~447 rewrites of a 288 KB document across a
  // ~1.4 h run — and the whole point of saving that often is that the run is expected to be
  // interrupted. A plain writeFileSync interrupted mid-flush leaves a truncated document that
  // the next run cannot parse, and what is lost is not only recomputable verdicts: `excluded`
  // holds the author's hand-written triage, which no re-run can reconstruct.
  const tmp = `${STATE_PATH}.tmp`;
  fs.writeFileSync(tmp, `${JSON.stringify(ordered, null, 2)}\n`);
  fs.renameSync(tmp, STATE_PATH);
}

// ---------------------------------------------------------------------------- docker

let dockerChecked = false;
function requireDocker() {
  if (dockerChecked) return;
  const probe = spawnSync("docker", ["version", "--format", "{{.Server.Version}}"], {
    encoding: "utf-8",
  });
  if (probe.status !== 0) {
    console.error(
      "docker is not reachable — every linter runs in a container.\n" +
        "Start the daemon, or run with --stats for the coverage table alone.",
    );
    process.exit(2);
  }
  dockerChecked = true;
}

/** Run one container, feed `input` on stdin, resolve with its captured streams. */
function runContainer(image, args, input) {
  return new Promise((resolve) => {
    const child = spawn(
      "docker",
      ["run", "--rm", "-i", "--network", "none", image, ...args],
      {
        stdio: ["pipe", "pipe", "pipe"],
      },
    );
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => (stdout += d));
    child.stderr.on("data", (d) => (stderr += d));
    child.on("error", (err) => resolve({ status: -1, stdout: "", stderr: String(err) }));
    child.on("close", (status) => resolve({ status, stdout, stderr }));
    child.stdin.on("error", () => {});
    child.stdin.end(input);
  });
}

// ---------------------------------------------------------------------------- adapters

/**
 * Diagnostic classes that are false *only because the file is an extract*. Each entry is a
 * deliberate, documented suppression — not a way to make the report look clean.
 */
const SHELLCHECK_IGNORED = new Set([
  "SC2148", // no shebang — the defining property of a fragment
  "SC2034", // variable appears unused — it is used in the part of the script not shown
  "SC2154", // variable referenced but not assigned — assigned in an earlier fragment
  "SC1090", // cannot follow a non-constant source
  "SC1091", // cannot find the sourced file — it is not in the article's files/
]);

/**
 * Remove `//` and block comments from JSONC, without touching their look-alikes inside strings.
 * Written by hand rather than pulled in as a dependency: `https://example.com` inside a value is
 * the exact case a naive `replace(/\/\/.*$/gm, "")` destroys, turning a valid file into a
 * reported syntax error. Comment bodies are replaced by nothing, but their newlines are kept so
 * a reported position still maps to the right line.
 */
function stripJsonComments(text) {
  let out = "";
  let inString = false;
  let escaped = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inString) {
      out += c;
      if (escaped) escaped = false;
      else if (c === "\\") escaped = true;
      else if (c === '"') inString = false;
      continue;
    }
    if (c === '"') {
      inString = true;
      out += c;
      continue;
    }
    if (c === "/" && text[i + 1] === "/") {
      while (i < text.length && text[i] !== "\n") i++;
      out += "\n";
      continue;
    }
    if (c === "/" && text[i + 1] === "*") {
      const end = text.indexOf("*/", i + 2);
      const body = text.slice(i, end === -1 ? text.length : end + 2);
      out += body.replace(/[^\n]/g, "");
      i = end === -1 ? text.length : end + 1;
      continue;
    }
    out += c;
  }
  return out;
}

/**
 * Configuration files VS Code parses with its own JSONC reader, which tolerates both comments
 * and a trailing comma. A `composer.json` or a plain `config.json` is not in this set.
 */
const JSONC_FILENAMES = new Set([
  "settings.json",
  "devcontainer.json",
  "launch.json",
  "tasks.json",
  "extensions.json",
  "keybindings.json",
  "c_cpp_properties.json",
  "argv.json",
]);

const ADAPTERS = {
  async shellcheck(text, { dialect }) {
    const { stdout } = await runContainer(
      IMAGES.shellcheck,
      ["-f", "json", "-s", dialect, "-"],
      text,
    );
    let parsed;
    try {
      parsed = JSON.parse(stdout || "[]");
    } catch {
      return [];
    }
    return parsed
      .filter((d) => !SHELLCHECK_IGNORED.has(`SC${d.code}`))
      .map((d) => ({
        severity: d.level === "error" ? "error" : "warning",
        line: d.line,
        code: `SC${d.code}`,
        message: d.message,
      }));
  },

  async hadolint(text) {
    const { stdout } = await runContainer(
      IMAGES.hadolint,
      ["hadolint", "--format", "json", "-"],
      text,
    );
    let parsed;
    try {
      parsed = JSON.parse(stdout || "[]");
    } catch {
      return [];
    }
    return parsed.map((d) => ({
      severity: d.level === "error" ? "error" : "warning",
      line: d.line,
      code: d.code,
      message: d.message,
    }));
  },

  async yamllint(text) {
    // `relaxed` drops most presentation rules, and what it keeps as a *warning* — line length,
    // blank-line runs, comma spacing — is still presentation: 113 of them on the first run, none
    // saying anything about whether the YAML a reader copies will load. Only `relaxed`'s
    // error level is kept, which is where it puts the two things that matter: a syntax error and
    // a duplicated key.
    const { stdout } = await runContainer(
      IMAGES.yamllint,
      ["-f", "parsable", "-d", "relaxed", "-"],
      text,
    );
    const out = [];
    for (const line of stdout.split("\n")) {
      const m = line.match(/^.*?:(\d+):(\d+):\s*\[(\w+)\]\s*(.*?)\s*(?:\((\S+)\))?$/);
      if (!m) continue;
      if (m[3] !== "error") continue;
      out.push({
        severity: "error",
        line: Number(m[1]),
        code: m[5] ?? "yamllint",
        message: m[4],
      });
    }
    return out;
  },

  async "php-l"(text) {
    const { stdout, stderr } = await runContainer(IMAGES["php-l"], ["php", "-l"], text);
    const combined = `${stdout}\n${stderr}`;
    const m = combined.match(
      /(?:Parse|Fatal) error:\s*(.*?) in Standard input code on line (\d+)/,
    );
    if (!m) return [];
    return [{ severity: "error", line: Number(m[2]), code: "php-syntax", message: m[1] }];
  },

  async ruff(text) {
    // E9 (syntax) + F63/F7 (assert-on-tuple, f-string and `is`-literal errors). Deliberately
    // not the default rule set: import ordering and unused imports are noise on a ten-line
    // extract. F82 (undefined name) is excluded for the same reason shellcheck's SC2154 is —
    // the first run raised it 90 times across 16 files, every one of them a name imported in a
    // fragment the article shows earlier (`Faker`, `json`, `requests`). It is the single
    // largest false-positive class this corpus produces.
    const { stdout } = await runContainer(
      IMAGES.ruff,
      [
        "check",
        "--no-cache",
        "--select",
        "E9,F63,F7",
        "--stdin-filename",
        "snippet.py",
        "--output-format",
        "json",
        "-",
      ],
      text,
    );
    let parsed;
    try {
      parsed = JSON.parse(stdout || "[]");
    } catch {
      return [];
    }
    return parsed.map((d) => ({
      severity: "error",
      line: d.location?.row ?? 1,
      code: d.code,
      message: d.message,
    }));
  },

  // No container: JSON validity is decidable here, and a published `.json` a reader pastes into
  // a config file either parses or does not.
  //
  // Comments are stripped before parsing because most `.json` this blog publishes are VS Code
  // configuration files — `settings.json`, `devcontainer.json`, `launch.json` — where `//` is
  // legal and idiomatic. What survives the strip is still reported: a trailing comma in a
  // `composer.json` is a real defect for anyone who copies it, and the first run found one.
  async "json-parse"(text, _spec, relPath) {
    // `devcontainer.part2.json` is a `devcontainer.json`: the fragment suffix sits *before* the
    // extension, so it has to come off before the filename is looked up.
    const jsonc = JSONC_FILENAMES.has(
      path.basename(relPath).replace(/\.part\d+(?=\.[^.]+$)/i, ""),
    );
    let candidate = stripJsonComments(text);
    // VS Code's own parser accepts a trailing comma in these files, so flagging one would be
    // reporting a defect the reader will never hit. Everywhere else it stays an error: the
    // first run found one in a published `composer.json`, where `composer` does fail on it.
    if (jsonc) candidate = candidate.replace(/,(\s*[}\]])/g, "$1");
    try {
      JSON.parse(candidate);
      return [];
    } catch (err) {
      const m = String(err.message).match(/position (\d+)/);
      const line = m ? candidate.slice(0, Number(m[1])).split("\n").length : 1;
      return [{ severity: "error", line, code: "json-syntax", message: err.message }];
    }
  },
};

// ---------------------------------------------------------------------------- corpus

/** Every distinct file referenced by a `<Snippet>`/`<Terminal source>` in the scanned articles. */
function collectCorpus() {
  const pathspecs = options.ci
    ? ["blog/**/*.md", "blog/**/*.mdx"]
    : ["blog/**/*.md", "blog/**/*.mdx", ".unpublished/**/*.md", ".unpublished/**/*.mdx"];

  const { hits } = scanSnippetTags(projectRoot, { pathspecs });
  const seen = new Map();
  for (const hit of hits) {
    if (!hit.absoluteSourcePath) continue;
    const rel = path.relative(projectRoot, hit.absoluteSourcePath);
    // Only the corpus this TODO is about: files the articles ship alongside themselves. A
    // `<Snippet source>` pointing at src/ or plugins/ is the site's own code, already covered
    // by ESLint and tsc.
    if (!/(^|\/)files\//.test(rel)) continue;
    if (!seen.has(rel) && fs.existsSync(hit.absoluteSourcePath))
      seen.set(rel, hit.absoluteSourcePath);
  }
  return [...seen.keys()].sort();
}

// ---------------------------------------------------------------------------- run

async function pool(items, worker, size) {
  const results = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(size, items.length) }, async () => {
      while (true) {
        const i = next++;
        if (i >= items.length) return;
        results[i] = await worker(items[i], i);
      }
    }),
  );
  return results;
}

async function main() {
  const state = loadState();

  // --- triage sub-commands: they mutate `excluded` and exit, never lint.
  if (options.exclude) {
    if (!options.reason) {
      console.error('--exclude requires --reason "why this file cannot be linted"');
      process.exit(2);
    }
    state.excluded[options.exclude] = options.reason;
    saveState(state);
    console.log(`excluded  ${options.exclude}\n          ${options.reason}`);
    return 0;
  }
  if (options.unexclude) {
    delete state.excluded[options.unexclude];
    saveState(state);
    console.log(`re-included  ${options.unexclude}`);
    return 0;
  }

  let corpus = collectCorpus();
  if (options.only) {
    const needle = options.only.replace(/^\.\//, "");
    corpus = corpus.filter((p) => p === needle || p.startsWith(needle));
    if (corpus.length === 0) {
      console.error(`--only ${options.only} matched no published snippet.`);
      process.exit(2);
    }
  }

  // Classify the whole corpus first — cheap, and it is what makes coverage reportable.
  const classified = corpus.map((rel) => {
    const raw = fs.readFileSync(path.join(projectRoot, rel), "utf-8");
    const { language, reason } = dispatchSnippet(rel, raw);
    return { rel, raw, hash: hashSource(raw), language, reason };
  });

  if (options.stats) {
    reportCoverage(classified, state);
    return 0;
  }

  const excluded = classified.filter((c) => state.excluded[c.rel]);
  const unsupported = classified.filter((c) => !state.excluded[c.rel] && !c.language);
  const lintable = classified.filter((c) => !state.excluded[c.rel] && c.language);

  // `--judge-only` runs pass 2 against the stored pass-1 verdicts without re-opening a single
  // container: the two passes are independent, so reviewing prompts should not cost a 27 s sweep.
  const stale = options.judgeOnly
    ? []
    : options.force
      ? lintable
      : lintable.filter((c) => state.files[c.rel]?.hash !== c.hash);

  if (stale.length > 0) requireDocker();

  const started = Date.now();
  await pool(
    stale,
    async (entry) => {
      const { text } = normalizeSnippet(entry.raw);
      const spec = LANGUAGES[entry.language];
      const diagnostics = await ADAPTERS[spec.linter](text, spec, entry.rel);
      state.files[entry.rel] = {
        // The two passes are independent (TODO 0137, acceptance criterion 2), and this line is
        // what makes that true: re-linting rewrites the entry wholesale, so a stored `judge`
        // verdict has to be carried across explicitly or every container run would silently
        // discard hours of GPU. It carries its OWN hash, so it is not revalidated here — the
        // judge loop below decides for itself whether it is still current.
        judge: state.files[entry.rel]?.judge,
        hash: entry.hash,
        language: entry.language,
        linter: spec.linter,
        diagnostics,
      };
    },
    CONCURRENCY,
  );
  const elapsed = ((Date.now() - started) / 1000).toFixed(1);

  // Record UNSUPPORTED files too: a key for every file is what makes "never analysed" impossible.
  for (const entry of unsupported) {
    state.files[entry.rel] = {
      judge: state.files[entry.rel]?.judge,
      hash: entry.hash,
      language: null,
      linter: null,
      unsupportedReason: entry.reason,
      diagnostics: [],
    };
  }
  // Drop entries for files that no article references any more.
  const live = new Set(classified.map((c) => c.rel));
  if (!options.only) {
    for (const key of Object.keys(state.files))
      if (!live.has(key)) delete state.files[key];
  }

  saveState(state);

  const judgeRun = await runJudge({ state, lintable });
  if (judgeRun.analysed > 0) saveState(state);

  const findings = [];
  for (const entry of lintable) {
    for (const d of state.files[entry.rel]?.diagnostics ?? [])
      findings.push({ ...d, rel: entry.rel });
    for (const d of state.files[entry.rel]?.judge?.findings ?? [])
      findings.push({ ...d, rel: entry.rel });
  }

  // The ratchet (TODO 0139): a code that has been driven to zero across the whole published
  // corpus is promoted to error severity, so it can never come back. Everything else stays a
  // non-blocking warning.
  for (const f of findings) {
    if (f.severity === "warning" && RATCHETED_CODES.has(f.code)) f.severity = "error";
  }

  if (options.json) {
    console.log(
      JSON.stringify(
        { findings, analysed: stale.length, skipped: lintable.length - stale.length },
        null,
        2,
      ),
    );
  } else {
    reportFindings({ findings, lintable, stale, unsupported, excluded, elapsed });
  }

  return findings.some((f) => f.severity === "error") ? 1 : 0;
}

// ---------------------------------------------------------------------------- pass 2

/**
 * Pass 2 — the obsolescence judge (TODO 0137). Opt-in, slow, and never blocking.
 *
 * Off unless `--judge`/`--judge-only` is passed: at ~30-36 s per file this is ~4 h over the 447
 * lintable snippets, which is a background batch job, not something a pre-commit run may
 * discover for itself.
 *
 * Serial on purpose, where pass 1 runs 8 containers at once: those wait on the Docker daemon,
 * this waits on a single GPU, and issuing 8 concurrent generations to one Ollama makes the whole
 * batch slower while making the ETA unreadable.
 */
async function runJudge({ state, lintable }) {
  if (!options.judge && !options.judgeOnly) return { analysed: 0, skipped: null };

  // Degrades to "as if it did not exist", the same contract lib/anythingllm.mjs holds for its
  // own optional local service — the run continues, pass 1's verdict stands.
  const disabled = judgeDisabled();
  if (disabled) {
    if (!options.quiet) console.log(`judge: skipped (${disabled}).`);
    return { analysed: 0, skipped: disabled };
  }
  if (!(await judgeReachable())) {
    if (!options.quiet) {
      console.log(
        `judge: skipped — Ollama is not answering (set OLLAMA_URL to override).`,
      );
    }
    return { analysed: 0, skipped: "unreachable" };
  }

  // A verdict is stale when the file changed OR when the prompt changed. The second half is
  // what keeps the two passes independent: editing the prompt costs a judge re-run, never a
  // 447-file container sweep.
  let due = lintable.filter(
    (c) =>
      options.force ||
      state.files[c.rel]?.judge?.hash !== c.hash ||
      state.files[c.rel]?.judge?.promptVersion !== JUDGE_PROMPT_VERSION,
  );
  const total = due.length;
  const limit = options.judgeLimit ? Number(options.judgeLimit) : null;
  if (limit && due.length > limit) due = due.slice(0, limit);

  if (due.length === 0) {
    if (!options.quiet) console.log(`judge: nothing to re-judge (${JUDGE_MODEL}).`);
    return { analysed: 0, skipped: null };
  }

  if (!options.quiet) {
    console.log(
      `judge: ${due.length} file(s) to review with ${JUDGE_MODEL}` +
        (limit && total > limit ? ` (of ${total} due — --judge-limit ${limit})` : "") +
        ` — roughly ${Math.ceil((due.length * 33) / 60)} min.`,
    );
  }

  const started = Date.now();
  let failed = 0;
  for (const [i, entry] of due.entries()) {
    const { text } = normalizeSnippet(entry.raw);
    const result = await judgeSnippet({ rel: entry.rel, text, language: entry.language });
    if (result.error) failed++;
    state.files[entry.rel] = {
      ...state.files[entry.rel],
      judge: {
        hash: entry.hash,
        promptVersion: JUDGE_PROMPT_VERSION,
        model: JUDGE_MODEL,
        judgedAt: new Date().toISOString(),
        durationMs: result.durationMs,
        ...(result.error ? { error: result.error } : {}),
        ...(result.truncated ? { truncated: true } : {}),
        findings: result.findings,
      },
    };
    // Written after every file, not at the end: a four-hour batch interrupted at hour three must
    // keep the three hours it paid for.
    saveState(state);
    if (!options.quiet) {
      console.log(
        `  [${i + 1}/${due.length}] ${(result.durationMs / 1000).toFixed(0)}s  ` +
          `${result.findings.length} suggestion(s)  ${entry.rel}` +
          (result.error ? `  — ${result.error}` : ""),
      );
    }
  }

  const elapsed = ((Date.now() - started) / 60000).toFixed(1);
  if (!options.quiet) {
    console.log(
      `judge: ${due.length} reviewed in ${elapsed} min` +
        (failed > 0 ? `, ${failed} failed (verdict left empty)` : "") +
        (limit && total > limit ? `, ${total - due.length} still due` : "") +
        ".",
    );
  }
  return { analysed: due.length, skipped: null, failed };
}

// ---------------------------------------------------------------------------- reporting

const SEVERITY_ORDER = { error: 0, warning: 1, suggestion: 2 };

function reportFindings({ findings, lintable, stale, unsupported, excluded, elapsed }) {
  findings.sort(
    (a, b) =>
      SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] ||
      a.rel.localeCompare(b.rel) ||
      a.line - b.line,
  );

  const TAGS = { error: "ERROR  ", warning: "warning", suggestion: "suggest" };
  for (const f of findings) {
    console.log(`${TAGS[f.severity]}  ${f.rel}:${f.line}  [${f.code}] ${f.message}`);
  }

  const errors = findings.filter((f) => f.severity === "error").length;
  const suggestions = findings.filter((f) => f.severity === "suggestion").length;
  const warnings = findings.length - errors - suggestions;

  console.log(
    `\nsnippet lint: ${stale.length} analysed, ${lintable.length - stale.length} unchanged, ` +
      `${unsupported.length} unsupported, ${excluded.length} excluded — ${errors} error(s), ${warnings} warning(s)` +
      (suggestions > 0 ? `, ${suggestions} suggestion(s)` : "") +
      ` in ${elapsed}s.`,
  );
  if (suggestions > 0) {
    // Stated every time they appear: a suggestion is the judge's opinion on an extract, and
    // TODO 0132 measured what an unqualified machine verdict over this corpus is worth — 133
    // of its first 139 diagnostics were artefacts of the file being a fragment.
    console.log(
      `(suggestions come from the pass-2 judge — a proposal to read, never a failure; they never affect the exit code)`,
    );
  }
  if (unsupported.length > 0) {
    console.log(`(run with --stats for the per-type coverage table)`);
  }
}

function reportCoverage(classified, state) {
  const buckets = new Map();
  for (const c of classified) {
    const key = state.excluded[c.rel] ? "excluded (triaged)" : (c.language ?? c.reason);
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  const rows = [...buckets.entries()].sort((a, b) => b[1] - a[1]);
  const width = Math.max(...rows.map(([k]) => k.length));
  console.log(`published snippets: ${classified.length}\n`);
  for (const [key, count] of rows) {
    const checked = Object.keys(LANGUAGES).includes(key) ? "checked    " : "not checked";
    console.log(`  ${checked}  ${String(count).padStart(4)}  ${key.padEnd(width)}`);
  }
  const covered = classified.filter((c) => c.language && !state.excluded[c.rel]).length;
  console.log(
    `\ncoverage: ${covered}/${classified.length} (${((covered / classified.length) * 100).toFixed(1)}%)`,
  );
}

// `process.exitCode`, never `process.exit()`: the latter tears the process down before an
// async write to a *pipe* has flushed, which truncates `--json` output the moment this script
// is piped into jq rather than a terminal.
main().then(
  (code) => {
    process.exitCode = code;
  },
  (err) => {
    console.error(err);
    process.exitCode = 2;
  },
);
