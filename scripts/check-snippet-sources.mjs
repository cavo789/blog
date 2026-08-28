#!/usr/bin/env node
/**
 * Audit every `<Snippet source="…">` / `<Terminal source="…">` in blog content against
 * the filesystem: `remark-snippet-loader` (plugins/remark-snippet-loader/index.cjs) now
 * throws a hard build error when a source is missing, but that only surfaces after a full
 * `yarn build` (~60s). This script runs the same resolution logic in well under a second,
 * so `yarn lint` catches a dangling reference before anyone waits for a build.
 *
 * Written after 4 published articles silently broke during the JS-to-TypeScript component
 * migration (see .todos/0106-migration-composants-js-vers-typescript.md): each one
 * referenced a component's live source file by its old `.js`/`.jsx` path, which the rename
 * to `.tsx` left dangling. The build did not fail at the time — the loader used to degrade
 * to a `// Error loading source file` placeholder instead of throwing.
 *
 * This is a regex-based heuristic, not a full MDX/AST parse (unlike the loader itself):
 * it will not catch a `source` passed as a JS expression (`source={variable}`) instead of a
 * string literal, and an attribute value containing a literal `>` could throw off tag
 * boundary detection. Neither pattern is used anywhere in this corpus today. The build's
 * own loader is the authoritative check; this script exists to catch the common case fast.
 *
 * Fenced and inline code spans are blanked out before scanning — several articles show
 * `<Snippet source="...">` as a *documentation example* inside backticks (this very script
 * is documented that way in eli5-snippet-docusaurus), which is prose, not a real component
 * invocation, and must not be flagged as a dangling reference.
 *
 * Usage:
 *   node scripts/check-snippet-sources.mjs [--quiet]
 *
 * With --quiet: print nothing unless at least one dangling reference is found.
 * Always exits 1 if any `source` fails to resolve to a real file, 0 otherwise.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execFileSync } from "child_process";
import { createRequire } from "module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const require = createRequire(import.meta.url);
const { resolveSourcePath } = require("../plugins/remark-snippet-loader/index.cjs");

const quiet = process.argv.includes("--quiet");

// Same rationale as check-eli5-freshness.mjs: `git ls-files` avoids recursing into
// sibling git worktrees (e.g. .claude/worktrees/agent-*) that a plain glob would hit.
const gitListArgs = [
  "ls-files",
  "--cached",
  "--others",
  "--exclude-standard",
  "-z",
  "--",
  "blog/**/*.md",
  "blog/**/*.mdx",
  ".unpublished/**/*.md",
  ".unpublished/**/*.mdx",
];
const relFiles = execFileSync("git", gitListArgs, { cwd: projectRoot, encoding: "utf-8" })
  .split("\0")
  .filter(Boolean);

// Matches an opening <Snippet …> or <Terminal …> tag (self-closing or not), across
// multiple lines — attributes are frequently wrapped one-per-line in this corpus.
const tagRegex = /<(Snippet|Terminal)\b([^>]*?)\/?>/gs;
const sourceAttrRegex = /\bsource\s*=\s*"([^"]*)"/;

// Blank out fenced (```…```) and inline (`…`) code spans, preserving every
// newline so reported line numbers still point at the right source line.
function blankOutCodeSpans(text) {
  const blank = (s) => s.replace(/[^\n]/g, " ");
  return text.replace(/```[\s\S]*?```/g, blank).replace(/`[^`\n]*`/g, blank);
}

let checked = 0;
let missing = 0;

for (const relFile of relFiles) {
  const absFile = path.resolve(projectRoot, relFile);
  const rawContent = fs.readFileSync(absFile, "utf-8");
  const content = blankOutCodeSpans(rawContent);
  const currentFileDir = path.dirname(absFile);

  for (const match of content.matchAll(tagRegex)) {
    const [, tagName, attrsText] = match;
    const sourceMatch = attrsText.match(sourceAttrRegex);
    if (!sourceMatch) continue; // e.g. inline <Terminal>content</Terminal>, no source=

    const sourcePath = sourceMatch[1];
    checked += 1;

    const absoluteSourcePath = resolveSourcePath(sourcePath, currentFileDir, projectRoot);
    if (!fs.existsSync(absoluteSourcePath)) {
      missing += 1;
      const lineNumber = content.slice(0, match.index).split("\n").length;
      console.error(
        `${relFile}:${lineNumber}  <${tagName} source="${sourcePath}">  →  missing ${path.relative(projectRoot, absoluteSourcePath)}`,
      );
    }
  }
}

if (!quiet) {
  console.log(
    `\nsnippet sources: ${checked} checked across ${relFiles.length} file(s), ${missing} missing.`,
  );
}

if (missing > 0) {
  console.error(
    `\n${missing} dangling <Snippet>/<Terminal> source reference(s) — fix the path or restore the file before building.`,
  );
  process.exit(1);
}
