#!/usr/bin/env node
/**
 * Detect drift between *.questions.json sidecar files and the article they describe, and
 * flag published articles that have no sidecar at all yet (a new article, or one written
 * before this pipeline existed). A source edit can invalidate generated questions (a removed
 * heading breaks an anchor, a rewritten section makes a question stop matching) without
 * anything catching it — this flags that drift the same way check-eli5-freshness.mjs does
 * for .eli5.json. Coverage (missing sidecars) has no equivalent in the eli5 checker, since
 * eli5 annotations are opt-in per snippet, not expected for every article.
 *
 * Usage:
 *   node scripts/check-questions-freshness.mjs [--strict]
 *
 * Without --strict: report-only, always exits 0.
 * With --strict: exits 1 if any STALE or ORPHANED sidecar is found. Missing coverage never
 * fails --strict — a freshly written article legitimately has no questions yet until someone
 * runs `yarn questions` for it; this check only surfaces that, it doesn't gate commits on it.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execFileSync } from "child_process";
import { hashSource } from "./lib/eli5-hash.mjs";
import { loadPosts } from "./lib/blog-corpus.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const strict = process.argv.includes("--strict");

// Enumerate via git rather than a filesystem walk — see check-eli5-freshness.mjs for why
// (sibling worktrees under the project root would otherwise be double-counted).
const gitListArgs = [
  "ls-files",
  "--cached",
  "--others",
  "--exclude-standard",
  "-z",
  "--",
  "*.questions.json",
];
const relFiles = execFileSync("git", gitListArgs, { cwd: projectRoot, encoding: "utf-8" })
  .split("\0")
  .filter(Boolean);
const files = relFiles.map((f) => path.resolve(projectRoot, f));

let fresh = 0,
  stale = 0,
  orphaned = 0;

for (const jsonPath of files) {
  const relJson = path.relative(projectRoot, jsonPath);
  const sourcePath = jsonPath.slice(0, -".questions.json".length);
  const relSource = path.relative(projectRoot, sourcePath);

  if (!fs.existsSync(sourcePath)) {
    console.warn(`⚠  ORPHANED — source missing for ${relJson}`);
    orphaned++;
    continue;
  }

  let record;
  try {
    record = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  } catch {
    console.warn(`⚠  UNREADABLE — ${relJson} is not valid JSON`);
    orphaned++;
    continue;
  }

  const currentHash = hashSource(fs.readFileSync(sourcePath, "utf-8"));
  if (currentHash !== record.sourceHash) {
    console.warn(`⚠  STALE — ${relSource} changed since ${relJson} was generated`);
    stale++;
  } else {
    fresh++;
  }
}

// Coverage — published articles (drafts already excluded by loadPosts()) with no sidecar at
// all yet: a new article, or one written before this pipeline existed. Not a freshness
// problem (nothing to compare against), just a gap worth surfacing.
const missing = loadPosts().filter(
  (post) => !fs.existsSync(`${post.file}.questions.json`),
);

console.log(
  `\nquestions freshness: ${fresh} fresh, ${stale} stale, ${orphaned} orphaned (of ${files.length} sidecar file(s)).`,
);
if (stale > 0) {
  console.log(`   Regenerate stale sidecars with: yarn questions --force <article-file>`);
}

console.log(
  `questions coverage: ${missing.length} published article(s) with no sidecar yet.`,
);
if (missing.length > 0) {
  // Capped — this is a report-only hook that can run on every commit; a 235-line dump (the
  // corpus-wide count before `yarn questions:bulk` has caught up) would drown the real signal.
  const MAX_LISTED = 10;
  for (const post of missing.slice(0, MAX_LISTED)) {
    console.log(`  - ${path.relative(projectRoot, post.file)}`);
  }
  if (missing.length > MAX_LISTED) {
    console.log(`  … and ${missing.length - MAX_LISTED} more.`);
  }
  console.log(
    `   Generate them with: yarn questions <article-file>  (or yarn questions:bulk)`,
  );
}

if (strict && (stale > 0 || orphaned > 0)) {
  process.exit(1);
}
