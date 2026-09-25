/**
 * "Which linter, if any, owns this published snippet?" — the one place that decides.
 *
 * Kept apart from lint-snippets.mjs because the answer is pure path/content reasoning with no
 * Docker and no I/O beyond the file's own first line, which makes it the part worth testing
 * and reading on its own.
 *
 * Two corpus facts drive the shape of this table, both measured on 2026-09-25:
 *
 *   - **`.partN` runs to `.part45`, not `.part4`.** 81 files carry a numbered fragment suffix,
 *     and `path.extname()` on `makefile.part12` returns `.part12`, which names no language. The
 *     suffix is therefore stripped and the *remaining* name re-dispatched — `makefile.part12` →
 *     `makefile`, `Dockerfile.part2` → `Dockerfile`. Deterministic, no guessing.
 *   - **60 referenced files have no extension at all**, of which 58 are `Dockerfile` and 13 are
 *     `makefile`. The rest are zsh helper functions meant to be sourced (`dstop`, `_d_print_cmd`).
 *     Those carry no shebang, and guessing "probably shell" is what would produce the fragment
 *     noise TODO 0132 warns about — so an extension-less file is only claimed when its name or
 *     its shebang says what it is. Anything else is UNSUPPORTED, reported, and never linted.
 *
 * UNSUPPORTED is a first-class outcome, not a failure: it is what makes coverage visible. A type
 * nothing can check (`.txt` terminal transcripts, `makefile`, `.htaccess`) must show up in the
 * report as "not checked", because the 2026-09-18 lesson of this repo is that a gap which
 * appears in no listing is a gap nobody closes.
 */

import path from "node:path";

/** Fragment suffix: `foo.part2` … `foo.part45`. */
const PART_SUFFIX_RE = /\.part\d+$/i;

/** First line, for shebang sniffing. */
const SHEBANG_RE = /^#!\s*\S*\b(bash|sh|dash|ksh|zsh|python[\d.]*|php|node)\b/;

/**
 * Languages this linter fleet can actually check, and how each one is invoked.
 * `dialect` is passed through to the adapter in lint-snippets.mjs.
 */
export const LANGUAGES = {
  shell: { linter: "shellcheck", dialect: "bash" },
  dockerfile: { linter: "hadolint" },
  yaml: { linter: "yamllint" },
  php: { linter: "php-l" },
  python: { linter: "ruff" },
  json: { linter: "json-parse" },
};

/**
 * Decide the language of one published snippet.
 *
 * @param {string} relPath repository-relative path, used for name-based rules.
 * @param {string} content raw content, used only to read a shebang.
 * @returns {{language: string|null, reason: string}} `language` null means UNSUPPORTED, and
 *   `reason` is what the coverage report prints next to the file.
 */
export function dispatchSnippet(relPath, content) {
  const base = path.basename(relPath);

  // `.part12` names no language — strip it and decide on what is left.
  if (PART_SUFFIX_RE.test(base)) {
    return dispatchSnippet(
      path.join(path.dirname(relPath), base.replace(PART_SUFFIX_RE, "")),
      content,
    );
  }

  // Name-based rules come first: `Dockerfile`, `Dockerfile.prod` and `app.Dockerfile` are all
  // Dockerfiles, and none of them is identified by `path.extname()`.
  if (/^Dockerfile(\..+)?$/i.test(base) || /\.Dockerfile$/i.test(base)) {
    return { language: "dockerfile", reason: "" };
  }
  if (/^(GNUm|M|m)akefile$/.test(base)) {
    return { language: null, reason: "makefile — no linter wired" };
  }

  const ext = path.extname(base).toLowerCase();
  switch (ext) {
    case ".sh":
    case ".bash":
      return { language: "shell", reason: "" };
    case ".zsh":
      // shellcheck has no zsh dialect; running it as bash reports syntax that is valid zsh.
      return { language: null, reason: "zsh — shellcheck has no zsh dialect" };
    case ".yaml":
    case ".yml":
      return { language: "yaml", reason: "" };
    case ".php":
      return { language: "php", reason: "" };
    case ".py":
      return { language: "python", reason: "" };
    case ".json": {
      // A `.json` extract that does not open a document (`{` or `[`) is a set of keys meant to
      // be pasted *inside* an existing file — `settings.json` fragments, above all. It can never
      // parse on its own, and reporting that is noise, not a finding.
      const head = content.replace(/^\uFEFF/, "").trimStart();
      if (!head.startsWith("{") && !head.startsWith("[")) {
        return {
          language: null,
          reason: "JSON fragment — keys meant to be pasted into a file",
        };
      }
      return { language: "json", reason: "" };
    }
    case "":
      break; // fall through to shebang sniffing
    default:
      return { language: null, reason: `${ext} — no linter wired` };
  }

  // Extension-less: only a shebang gets it claimed.
  const firstLine = content.slice(0, content.indexOf("\n") + 1 || undefined);
  const m = firstLine.match(SHEBANG_RE);
  if (m) {
    const interpreter = m[1].toLowerCase();
    if (interpreter === "zsh")
      return { language: null, reason: "zsh — shellcheck has no zsh dialect" };
    if (interpreter.startsWith("python")) return { language: "python", reason: "" };
    if (interpreter === "php") return { language: "php", reason: "" };
    if (interpreter === "node")
      return { language: null, reason: "node — no linter wired" };
    return { language: "shell", reason: "" };
  }

  return {
    language: null,
    reason: "no extension and no shebang — fragment meant to be sourced",
  };
}
