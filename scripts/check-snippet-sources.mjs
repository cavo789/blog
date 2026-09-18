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
 * The scan itself — which tags count, and the code-span blanking that keeps a documented
 * `<Snippet source="...">` inside backticks from being read as a real invocation — lives in
 * `scripts/lib/snippet-scan.mjs`, shared with check-eli5-freshness.mjs's coverage pass.
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
import { scanSnippetTags } from "./lib/snippet-scan.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const quiet = process.argv.includes("--quiet");

// Both components: a `<Terminal source="…">` pointing at a deleted file breaks the build
// exactly like a `<Snippet>` one. Drafts are scanned too — a dangling path is worth fixing
// before the article goes live, not after.
const { files, hits } = scanSnippetTags(projectRoot, {
  pathspecs: [
    "blog/**/*.md",
    "blog/**/*.mdx",
    ".unpublished/**/*.md",
    ".unpublished/**/*.mdx",
  ],
});

let missing = 0;

for (const hit of hits) {
  if (fs.existsSync(hit.absoluteSourcePath)) continue;

  missing += 1;
  console.error(
    `${hit.relFile}:${hit.lineNumber}  <${hit.tagName} source="${hit.sourcePath}">  →  missing ${path.relative(projectRoot, hit.absoluteSourcePath)}`,
  );
}

if (!quiet) {
  console.log(
    `\nsnippet sources: ${hits.length} checked across ${files.length} file(s), ${missing} missing.`,
  );
}

if (missing > 0) {
  console.error(
    `\n${missing} dangling <Snippet>/<Terminal> source reference(s) — fix the path or restore the file before building.`,
  );
  process.exit(1);
}
