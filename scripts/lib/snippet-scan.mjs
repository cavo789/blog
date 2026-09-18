/**
 * The one place that knows how to find a `<Snippet source="…">` in this corpus.
 *
 * Three callers need the same answer to "which source files does the blog show?" —
 * `check-snippet-sources.mjs` (does the file still exist?), `check-eli5-freshness.mjs`
 * (does it carry an ELI5 annotation?) and anything added later. Each one carrying its own
 * regex is how they drift, and the part that drifts first is not the regex: it is
 * `blankOutCodeSpans`. Several articles document the component by showing
 * `<Snippet source="...">` inside backticks — prose, not a component invocation. A scan
 * that forgets to blank code spans reports 15 dangling references on a corpus that has
 * zero, which is exactly what a hand-rolled second copy produced.
 *
 * Deliberately a regex heuristic and not an MDX parse, matching the loader's own contract:
 * a `source` passed as an expression (`source={variable}`) is not seen, and an attribute
 * value containing a literal `>` would throw off tag boundary detection. Neither pattern
 * exists in this corpus. `remark-snippet-loader` remains the authoritative resolver — it is
 * imported here rather than reimplemented, so "where does this path point?" has one answer.
 */

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { resolveSourcePath } = require("../../plugins/remark-snippet-loader/index.cjs");

const SOURCE_ATTR_RE = /\bsource\s*=\s*"([^"]*)"/;

/**
 * Blanks out fenced (```…```) and inline (`…`) code spans, preserving every newline so
 * reported line numbers still point at the right source line.
 */
export function blankOutCodeSpans(text) {
  const blank = (s) => s.replace(/[^\n]/g, " ");
  return text.replace(/```[\s\S]*?```/g, blank).replace(/`[^`\n]*`/g, blank);
}

/**
 * Every `<Snippet>`/`<Terminal>` tag carrying a literal `source=` in the matched files.
 *
 * Enumerates via `git ls-files` rather than a filesystem walk: this repo's container can
 * have sibling git worktrees (`.claude/worktrees/agent-*`) checked out under the project
 * root, and a plain glob would recurse into their full copies too.
 *
 * @param {string} projectRoot
 * @param {object} options
 * @param {string[]} options.pathspecs git pathspecs naming the articles to scan.
 * @param {string[]} [options.tags] component names to match. Defaults to both; the ELI5
 *   caller passes `["Snippet"]`, because an annotation is a Snippet feature — the loader
 *   never injects `eli5json` into a `<Terminal>`, so demanding a sidecar for one would
 *   report a gap that cannot be filled.
 * @returns {{files: string[], hits: {relFile: string, rawContent: string, tagName: string,
 *   sourcePath: string, absoluteSourcePath: string, lineNumber: number}[]}} `files` is every
 *   article git listed (scanned or not), which is what a summary line counts.
 */
export function scanSnippetTags(
  projectRoot,
  { pathspecs, tags = ["Snippet", "Terminal"] },
) {
  const relFiles = execFileSync(
    "git",
    ["ls-files", "--cached", "--others", "--exclude-standard", "-z", "--", ...pathspecs],
    { cwd: projectRoot, encoding: "utf-8" },
  )
    .split("\0")
    .filter(Boolean);

  // Matches an opening tag (self-closing or not), across multiple lines — attributes are
  // frequently wrapped one-per-line in this corpus.
  const tagRegex = new RegExp(`<(${tags.join("|")})\\b([^>]*?)\\/?>`, "gs");
  const hits = [];

  for (const relFile of relFiles) {
    const absFile = path.resolve(projectRoot, relFile);
    // `--cached` still lists a tracked file whose deletion has not been staged yet (a draft
    // moved from .unpublished/ to blog/ before `git add`). Nothing to scan in that case.
    if (!fs.existsSync(absFile)) continue;

    const rawContent = fs.readFileSync(absFile, "utf-8");
    const content = blankOutCodeSpans(rawContent);
    const currentFileDir = path.dirname(absFile);

    for (const match of content.matchAll(tagRegex)) {
      const [, tagName, attrsText] = match;
      const sourceMatch = attrsText.match(SOURCE_ATTR_RE);
      if (!sourceMatch) continue; // e.g. inline <Terminal>content</Terminal>, no source=

      const sourcePath = sourceMatch[1];
      hits.push({
        relFile,
        rawContent,
        tagName,
        sourcePath,
        absoluteSourcePath: resolveSourcePath(sourcePath, currentFileDir, projectRoot),
        lineNumber: content.slice(0, match.index).split("\n").length,
      });
    }
  }

  return { files: relFiles, hits };
}
