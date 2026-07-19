#!/usr/bin/env node
/**
 * Detect drift between *.eli5.json annotation files and the source file they
 * describe. Line-numbered explanations silently go stale when a source file
 * gains/loses lines above an annotated one.
 *
 * Usage:
 *   node scripts/check-eli5-freshness.mjs [--strict]
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

for (const jsonPath of files) {
  const relJson = path.relative(projectRoot, jsonPath);
  const sourcePath = jsonPath.slice(0, -".eli5.json".length);
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

  if (!record.sourceHash) {
    legacy++;
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

console.log(
  `\neli5 freshness: ${fresh} fresh, ${stale} stale, ${orphaned} orphaned, ${legacy} legacy (no hash on record).`,
);
if (legacy > 0) {
  console.log(
    `   Legacy files predate freshness tracking — regenerate with --force to enable it.`,
  );
}

if (strict && (stale > 0 || orphaned > 0)) {
  process.exit(1);
}
