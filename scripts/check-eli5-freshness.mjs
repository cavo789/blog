#!/usr/bin/env node
/**
 * Detect drift between *.eli5.json annotation files and the source file they
 * describe. Line-numbered explanations silently go stale when a source file
 * gains/loses lines above an annotated one.
 *
 * Usage:
 *   node scripts/check-eli5-freshness.mjs [--strict] [--quiet]
 *
 * With --quiet: print nothing at all unless something is actually actionable (a stale,
 * orphaned or unreadable annotation). Counts, the legacy note and the summary line are
 * suppressed. This is what the pre-commit hook runs — the hook is verbose, so anything the
 * script prints shows up on every single commit, and "49 fresh, 0 stale" on every commit is
 * noise. Run the script by hand (`yarn eli5:check`) for the full report.
 *
 * Without --strict: report-only, always exits 0 (safe to wire into pre-commit
 * today, before CI has a dedicated lint gate — see TODO 036).
 * With --strict: exits 1 if any STALE or ORPHANED annotation is found.
 * Legacy files with no recorded hash (generated before this check existed)
 * are reported separately and never fail --strict; regenerate them
 * (`yarn eli5 --force <file>`) to bring them under tracking.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execFileSync } from "child_process";
import { hashSource } from "./lib/eli5-hash.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const strict = process.argv.includes("--strict");
const quiet = process.argv.includes("--quiet");

// Enumerate via git rather than a filesystem walk: this repo's container can
// have sibling git worktrees (e.g. .claude/worktrees/agent-*) checked out
// under the project root, and a plain glob would recurse into their full
// copies too. `git ls-files` only ever sees this worktree's own tree.
const gitListArgs = [
  "ls-files",
  "--cached",
  "--others",
  "--exclude-standard",
  "-z",
  "--",
  "*.eli5.json",
];
const relFiles = execFileSync("git", gitListArgs, { cwd: projectRoot, encoding: "utf-8" })
  .split("\0")
  .filter(Boolean);
const files = relFiles.map((f) => path.resolve(projectRoot, f));

let fresh = 0,
  stale = 0,
  orphaned = 0,
  legacy = 0;

// Collected so the summary can print one copy-pasteable command covering every stale file —
// there is no "regenerate only what drifted" mode in bulk-eli5.mjs (it skips on file
// existence, not on hash), so the per-file generator called in a loop is the only fix.
const staleSources = [];

for (const jsonPath of files) {
  const relJson = path.relative(projectRoot, jsonPath);
  const sourcePath = jsonPath.slice(0, -".eli5.json".length);
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
    console.warn(`   Fix with: yarn eli5 ${relSource} --force`);
    orphaned++;
    continue;
  }

  if (!record.sourceHash) {
    legacy++;
    continue;
  }

  const currentHash = hashSource(fs.readFileSync(sourcePath, "utf-8"));
  if (currentHash !== record.sourceHash) {
    console.warn(`⚠  STALE — ${relSource} changed since its annotation was generated`);
    console.warn(`   Fix with: yarn eli5 ${relSource} --force`);
    staleSources.push(relSource);
    stale++;
  } else {
    fresh++;
  }
}

// In quiet mode the warnings above (if any) are the whole message — everything below is
// context that only makes sense when someone asked for a report.
const actionable = stale > 0 || orphaned > 0;
if (!quiet || actionable) {
  console.log(
    `\neli5 freshness: ${fresh} fresh, ${stale} stale, ${orphaned} orphaned, ${legacy} legacy (no hash on record).`,
  );
}
// One command for the whole batch, so a multi-file drift is not seven copy/pastes.
if (staleSources.length > 1) {
  const list = staleSources.map((f) => `"${f}"`).join(" ");
  console.log(`   Fix all ${staleSources.length} at once:`);
  console.log(`   for f in ${list}; do yarn eli5 "$f" --force; done`);
}

if (legacy > 0 && !quiet) {
  // Deliberately worded to head off the mistake this line used to invite: "regenerate with
  // --force" reads as an instruction, and the only --force that takes no argument is
  // `yarn eli5:bulk --force` — 833 paid API calls to fix nothing that was broken.
  console.log(
    `   Nothing to do about the ${legacy} legacy file(s): they were generated before hashing` +
      ` existed, so they display fine but will never appear above if their source changes.`,
  );
  console.log(
    `   Each one gets a hash the next time it is regenerated. Regenerating them on purpose` +
      ` means yarn eli5:bulk --force — the whole corpus through the paid API. Not worth it.`,
  );
}

if (strict && (stale > 0 || orphaned > 0)) {
  process.exit(1);
}
