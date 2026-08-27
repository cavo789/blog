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
 *   node scripts/check-questions-freshness.mjs [--strict] [--quiet]
 *
 * With --quiet: print nothing at all unless something is actually actionable (a stale or
 * orphaned sidecar, or a published article with no sidecar yet). Counts and review progress
 * are suppressed. This is what the pre-commit hook runs — the hook is verbose, so anything
 * the script prints shows up on every single commit. Run it by hand (`yarn questions:check`)
 * for the full report.
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
const quiet = process.argv.includes("--quiet");

// Enumerate via git rather than a filesystem walk — see check-eli5-freshness.mjs for why
// (sibling worktrees under the project root would otherwise be double-counted).
const gitListArgs = [
  "ls-files",
  "--cached",
  "--others",
  "--exclude-standard",
  "-z",
  "--",
  // Scoped to blog/ on purpose: an article can *show* a sample sidecar in its own files/
  // folder (.unpublished/docusaurus-ask-my-blog/files/demo.questions.json), which is
  // documentation, not a corpus sidecar — repo-wide, it was reported as ORPHANED forever.
  "blog/*.questions.json",
];
const relFiles = execFileSync("git", gitListArgs, { cwd: projectRoot, encoding: "utf-8" })
  .split("\0")
  .filter(Boolean);
const files = relFiles.map((f) => path.resolve(projectRoot, f));

let fresh = 0,
  stale = 0,
  excluded = 0,
  orphaned = 0;

// Collected so the summary can offer one copy-pasteable command covering every stale sidecar
// — a batch of edited articles routinely produces eight or nine of these at once.
const staleSources = [];

for (const jsonPath of files) {
  const relJson = path.relative(projectRoot, jsonPath);
  const sourcePath = jsonPath.slice(0, -".questions.json".length);
  const relSource = path.relative(projectRoot, sourcePath);

  if (!fs.existsSync(sourcePath)) {
    console.warn(`⚠  ORPHANED — source missing for ${relJson}`);
    console.warn(`   Fix with: rm ${relJson}`);
    orphaned++;
    continue;
  }

  let record;
  try {
    record = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  } catch {
    console.warn(`⚠  UNREADABLE — ${relJson} is not valid JSON`);
    console.warn(`   Fix with: yarn questions --force ${relSource}`);
    orphaned++;
    continue;
  }

  // Articles deliberately excluded during review (scripts/questions-review.mjs) carry no
  // questions on purpose, so there is nothing to be stale about — editing the article must
  // not put them back on the "regenerate me" list.
  if (record.excluded === true) {
    excluded++;
    continue;
  }

  const currentHash = hashSource(fs.readFileSync(sourcePath, "utf-8"));
  if (currentHash !== record.sourceHash) {
    // No per-file warning here — staleSources feeds the single batched command printed
    // below, so nothing tempts a one-by-one `yarn questions --force` per file.
    staleSources.push(relSource);
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

// In quiet mode the warnings above (if any) are the whole message — the counts below are
// context that only makes sense when someone asked for a report.
const actionable = stale > 0 || orphaned > 0 || missing.length > 0;
if (!quiet || actionable) {
  console.log(
    `\nquestions freshness: ${fresh} fresh, ${stale} stale, ${excluded} excluded, ${orphaned} orphaned (of ${files.length} sidecar file(s)).`,
  );
}
if (staleSources.length > 0) {
  const list = staleSources.map((f) => `"${f}"`).join(" ");
  console.log(
    `⚠  STALE — ${staleSources.length} file(s) changed since their sidecar was generated:`,
  );
  console.log(`   for f in ${list}; do yarn questions --force "$f"; done`);
}

if (!quiet || missing.length > 0) {
  console.log(
    `questions coverage: ${missing.length} published article(s) with no sidecar yet.`,
  );
}
if (missing.length > 0) {
  // Capped — this is a report-only hook that can run on every commit; a 235-line dump (the
  // corpus-wide count before `yarn questions:bulk` has caught up) would drown the real signal.
  const MAX_LISTED = 10;
  for (const post of missing.slice(0, MAX_LISTED)) {
    console.log(`  - yarn questions ${path.relative(projectRoot, post.file)}`);
  }
  if (missing.length > MAX_LISTED) {
    console.log(
      `  … and ${missing.length - MAX_LISTED} more — cover them all with: yarn questions:bulk`,
    );
  }
}

// Human review progress — the sidecars are a first draft from a small local model until
// someone has read them (see scripts/questions-review.mjs).
const reviewed = files.filter((jsonPath) => {
  try {
    return Boolean(JSON.parse(fs.readFileSync(jsonPath, "utf-8")).reviewed);
  } catch {
    return false;
  }
}).length;

if (!quiet) {
  console.log(
    `questions review: ${reviewed}/${files.length} sidecar(s) reviewed by hand.` +
      (reviewed < files.length ? `  Continue with: yarn questions:review` : ""),
  );
}

if (strict && (stale > 0 || orphaned > 0)) {
  process.exit(1);
}
