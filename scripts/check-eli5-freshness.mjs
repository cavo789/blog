#!/usr/bin/env node
/**
 * Detect drift between *.eli5.json annotation files and the source file they
 * describe. Line-numbered explanations silently go stale when a source file
 * gains/loses lines above an annotated one.
 *
 * Two questions, not one:
 *
 *  - FRESHNESS walks the sidecars that exist and compares each recorded hash to its source.
 *  - COVERAGE walks the `<Snippet source="…">` of the published corpus and reports the ones
 *    carrying no sidecar at all. This half was missing until 2026-09-18, and the gap is not
 *    theoretical: two published articles (atuin-bash-history, docling) shipped four
 *    annotation-less snippets, and the hook stayed silent through every commit — a sidecar
 *    that does not exist appears in no `git ls-files` listing, so there was nothing to
 *    compare. Enumerating from the ARTICLES instead of from the sidecars is what closes it.
 *
 * An annotation stays opt-in per snippet: write `{"excluded": true}` as the sidecar to
 * declare one deliberately unannotated, exactly as scripts/questions-review.mjs does for
 * articles. Coverage then counts it as answered and freshness leaves it alone, so editing
 * the source never puts it back on the list. The loader tolerates such a file — no
 * `explanations` key means no `eli5json` prop injected, and the snippet renders plain.
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
 * With --strict: exits 1 if any STALE or ORPHANED annotation is found. Missing coverage
 * never fails --strict — a freshly written article legitimately has no annotations until
 * someone runs `eli5` for it; this check only surfaces that, it does not gate the commit.
 * Legacy files with no recorded hash (generated before this check existed)
 * are reported separately and never fail --strict; regenerate them
 * (`yarn eli5 --force <file>`) to bring them under tracking.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execFileSync } from "child_process";
import { hashSource } from "./lib/eli5-hash.mjs";
import { cmd } from "./lib/cheatsheet-hint.mjs";
import { scanSnippetTags } from "./lib/snippet-scan.mjs";
import { parseFrontMatter } from "./lib/blog-corpus.mjs";
import { eli5Candidates } from "./lib/i18n-eligibility.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const strict = process.argv.includes("--strict");
const quiet = process.argv.includes("--quiet");

// Enumerate via git rather than a filesystem walk: this repo's container can
// have sibling git worktrees (e.g. .claude/worktrees/agent-*) checked out
// under the project root, and a plain glob would recurse into their full
// copies too. `git ls-files` only ever sees this worktree's own tree.
//
// Two pathspecs, because `*.eli5.json` does not match `Dockerfile.eli5.fr.json` — the localized
// sidecars of TODO 0121 would otherwise drift forever without ever being reported.
const gitListArgs = [
  "ls-files",
  "--cached",
  "--others",
  "--exclude-standard",
  "-z",
  "--",
  "*.eli5.json",
  "*.eli5.*.json",
];
const relFiles = execFileSync("git", gitListArgs, { cwd: projectRoot, encoding: "utf-8" })
  .split("\0")
  .filter(Boolean);
const files = relFiles.map((f) => path.resolve(projectRoot, f));

// `<source>.eli5.json` (English) or `<source>.eli5.<locale>.json`. The capture tells the two
// apart, which decides both the source path and the command that regenerates the file.
const SIDECAR_RE = /\.eli5(?:\.([a-z]{2}))?\.json$/;

/** The command that regenerates one sidecar — English or localized. */
function regenCmd(relSource, locale) {
  return locale
    ? cmd("eli5", relSource, "--locale", locale, "--force")
    : cmd("eli5", relSource, "--force");
}

let fresh = 0,
  stale = 0,
  orphaned = 0,
  legacy = 0,
  excluded = 0;
// Sources the author declared deliberately unannotated — the coverage pass below must not
// ask for them back.
const excludedSources = new Set();

// Collected so the summary can print one copy-pasteable command covering every stale file —
// there is no "regenerate only what drifted" mode in bulk-eli5.mjs (it skips on file
// existence, not on hash), so the per-file generator called in a loop is the only fix.
// Keyed by locale ("" for English): the regeneration command differs per locale, so one flat
// list would print a command that silently rewrites French sidecars in English.
const staleSourcesByLocale = new Map();

for (const jsonPath of files) {
  const relJson = path.relative(projectRoot, jsonPath);
  const match = relJson.match(SIDECAR_RE);
  if (!match) continue;

  const locale = match[1] ?? "";
  const sourcePath = jsonPath.slice(0, -match[0].length);
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
    console.warn(`   Fix with: ${regenCmd(relSource, locale)}`);
    orphaned++;
    continue;
  }

  // Snippets deliberately left unannotated carry no explanations, so there is nothing to be
  // stale about — editing the source must not put them back on the "regenerate me" list.
  if (record.excluded === true) {
    excludedSources.add(relSource);
    excluded++;
    continue;
  }

  if (!record.sourceHash) {
    legacy++;
    continue;
  }

  const currentHash = hashSource(fs.readFileSync(sourcePath, "utf-8"));
  if (currentHash !== record.sourceHash) {
    // No per-file warning here — staleSourcesByLocale feeds the single batched command printed
    // below, so nothing tempts a one-by-one regeneration per file.
    if (!staleSourcesByLocale.has(locale)) staleSourcesByLocale.set(locale, []);
    staleSourcesByLocale.get(locale).push(relSource);
    stale++;
  } else {
    fresh++;
  }
}

// ── Coverage ─────────────────────────────────────────────────────────────────────────────
//
// Enumerated from the ARTICLES, not from the sidecars — that inversion is the whole point of
// this pass. `<Snippet>` only: the loader injects `eli5json` into a Snippet and never into a
// `<Terminal>`, so demanding a sidecar for terminal output would report a gap nothing can fill.
// Scoped to blog/ for the same reason the questions checker is: a `.unpublished/` draft is
// not yet worth paying the API for, and its snippets churn until the day it ships.
const { hits } = scanSnippetTags(projectRoot, {
  pathspecs: ["blog/**/index.md", "blog/**/index.mdx"],
  tags: ["Snippet"],
});

// One front-matter parse per article, not per snippet — htaccess alone carries 29.
const draftCache = new Map();
function isDraft(relFile, rawContent) {
  if (!draftCache.has(relFile)) {
    draftCache.set(relFile, parseFrontMatter(rawContent).data.draft === "true");
  }
  return draftCache.get(relFile);
}

const uncovered = new Map(); // relSource -> relFile of the article showing it
for (const hit of hits) {
  // `draft: true` under blog/ means "committed, awaiting the go" — it is absent from the
  // production build, so it is not yet a published gap.
  if (isDraft(hit.relFile, hit.rawContent)) continue;
  // A dangling source is check-snippet-sources.mjs's finding, and `yarn lint` fails on it.
  // Reporting it a second time here as "no annotation" would just bury the real cause.
  if (!fs.existsSync(hit.absoluteSourcePath)) continue;

  const relSource = path.relative(projectRoot, hit.absoluteSourcePath);
  if (excludedSources.has(relSource)) continue;
  if (fs.existsSync(`${hit.absoluteSourcePath}.eli5.json`)) continue;

  // A source shown by several articles (src/components/… is) is one missing annotation, not
  // three — the first article to mention it is enough to locate it.
  if (!uncovered.has(relSource)) uncovered.set(relSource, hit.relFile);
}

// Localized coverage — snippets whose English annotation exists but whose localized one does
// not yet. `eli5Candidates` owns the three eligibility conditions (article really translated,
// English sidecar present, localized one missing or stale); re-deriving them here is exactly
// what that module exists to prevent. Its `eligible` also carries the STALE localized
// sidecars, already reported above, so only the genuinely absent ones are kept.
const i18nRoot = path.join(projectRoot, "i18n");
const locales = fs.existsSync(i18nRoot)
  ? fs
      .readdirSync(i18nRoot, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
  : [];
const missingLocalized = locales.flatMap((locale) =>
  eli5Candidates(projectRoot, locale)
    .eligible.filter((file) => !fs.existsSync(`${file}.eli5.${locale}.json`))
    .map((file) => ({ locale, file: path.relative(projectRoot, file) })),
);

// In quiet mode the warnings above (if any) are the whole message — everything below is
// context that only makes sense when someone asked for a report.
const actionable =
  stale > 0 || orphaned > 0 || uncovered.size > 0 || missingLocalized.length > 0;
if (!quiet || actionable) {
  console.log(
    `\neli5 freshness: ${fresh} fresh, ${stale} stale, ${excluded} excluded, ${orphaned} orphaned, ${legacy} legacy (no hash on record).`,
  );
}
// One command per locale, so a multi-file drift is not seven copy/pastes — and so a French
// sidecar is never regenerated by a command that would write it in English.
if (stale > 0) {
  console.log(
    `⚠  STALE — ${stale} file(s) changed since their annotation was generated:`,
  );
  for (const [locale, sources] of staleSourcesByLocale) {
    const list = sources.map((f) => `"${f}"`).join(" ");
    const label = locale ? ` (${locale})` : "";
    console.log(`   ${sources.length} file(s)${label}:`);
    console.log(`   for f in ${list}; do ${regenCmd('"$f"', locale)}; done`);
  }
}

// Coverage is reported after freshness on purpose: a stale annotation is a wrong answer on a
// live page, a missing one is only an absent feature.
if (uncovered.size > 0) {
  console.log(
    `📭 COVERAGE — ${uncovered.size} published snippet(s) with no ELI5 annotation:`,
  );
  for (const [relSource, relFile] of uncovered) {
    console.log(`   ${relSource}   (shown by ${relFile})`);
  }
  const list = [...uncovered.keys()].map((f) => `"${f}"`).join(" ");
  console.log(`   for f in ${list}; do ${cmd("eli5", '"$f"')}; done`);
  console.log(
    `   Deliberately unannotated? Write {"excluded": true} as its .eli5.json and this stops asking.`,
  );
}

if (missingLocalized.length > 0) {
  const byLocale = new Map();
  for (const { locale } of missingLocalized)
    byLocale.set(locale, (byLocale.get(locale) || 0) + 1);
  for (const [locale, count] of byLocale) {
    console.log(
      `📭 COVERAGE (${locale}) — ${count} translated snippet(s) with an English annotation ` +
        `but no ${locale} one:`,
    );
    // The batch form, not a loop: generate-eli5.mjs --articles re-asks eli5Candidates for
    // itself, so a file that became fresh in between is never re-billed.
    const articles = [
      ...new Set(
        missingLocalized
          .filter((m) => m.locale === locale)
          .map((m) => m.file.split("/").slice(0, 5).join("/")),
      ),
    ];
    console.log(
      `   node scripts/generate-eli5.mjs --locale ${locale} --articles ${articles.join(" ")}`,
    );
  }
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
      ` means ${cmd("eli5:bulk", "--force")} — the whole corpus through the paid API.` +
      ` Not worth it.`,
  );
}

if (strict && (stale > 0 || orphaned > 0)) {
  process.exit(1);
}
