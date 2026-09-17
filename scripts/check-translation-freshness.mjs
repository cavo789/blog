#!/usr/bin/env node
/**
 * Report drift between an article under `blog/` and its French translation.
 *
 * Usage:
 *   node scripts/check-translation-freshness.mjs [--strict] [--quiet] [--locale fr]
 *
 * Deliberately modelled on `check-eli5-freshness.mjs`, which already solved this shape — same
 * `--quiet` contract (say nothing unless something is actionable, because the pre-commit hook
 * is verbose and a per-commit "4 fresh, 0 stale" is pure noise) and the same report-only
 * default: a missing translation must never block a commit.
 *
 * Three levels rather than a boolean, which is the whole point:
 *
 *   - FRESH   — the translatable content hash still matches;
 *   - MINOR   — under MINOR_DRIFT_THRESHOLD of the translatable blocks moved. Listed, never
 *               proposed for retranslation: fixing a typo must not flag 250 articles;
 *   - STALE   — at or above the threshold. Worth retranslating.
 *
 * "Translatable content" excludes code blocks, inline code, identifier-carrying props and
 * every front matter key except title/description — so bumping `review_date` or editing a
 * Dockerfile shown via <Snippet> produces NO drift at all. See scripts/lib/translate-hash.mjs.
 *
 * See TODO 0119.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { translatableHash, driftRatio } from "./lib/translate-hash.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const strict = process.argv.includes("--strict");
const quiet = process.argv.includes("--quiet");

const localeFlag = process.argv.indexOf("--locale");
const locale = localeFlag !== -1 ? process.argv[localeFlag + 1] : "fr";

/** Below this share of changed blocks, drift is "minor" and not worth a retranslation. */
const MINOR_DRIFT_THRESHOLD = 0.15;

const BLOG_DIR = path.join(projectRoot, "blog");
const I18N_DIR = path.join(projectRoot, "i18n", locale, "docusaurus-plugin-content-blog");

/** Recursively collects every article file under a directory. */
function findArticles(directory) {
  if (!fs.existsSync(directory)) return [];

  const found = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      found.push(...findArticles(target));
    } else if (entry.name === "index.md" || entry.name === "index.mdx") {
      found.push(target);
    }
  }
  return found;
}

function classify(sourcePath) {
  const relative = path.relative(BLOG_DIR, sourcePath);
  const translationPath = path.join(I18N_DIR, relative);
  const sidecarPath = `${translationPath}.translation.json`;

  if (!fs.existsSync(translationPath)) return { state: "UNTRANSLATED", relative };

  const source = fs.readFileSync(sourcePath, "utf-8");
  const currentHash = translatableHash(source);

  if (!fs.existsSync(sidecarPath)) {
    // Translated by hand, or produced before the sidecar existed: nothing to compare against.
    return { state: "UNTRACKED", relative };
  }

  let sidecar;
  try {
    sidecar = JSON.parse(fs.readFileSync(sidecarPath, "utf-8"));
  } catch {
    return { state: "UNREADABLE", relative };
  }

  if (sidecar.sourceHash === currentHash) return { state: "FRESH", relative };

  // The sidecar stores the English source as it was at translation time — that is what makes a
  // ratio possible at all, and what a diff-based retranslation will consume later.
  const ratio = sidecar.source ? driftRatio(sidecar.source, source) : 1;
  const percent = Math.round(ratio * 100);

  return {
    state: ratio < MINOR_DRIFT_THRESHOLD ? "MINOR" : "STALE",
    relative,
    percent,
  };
}

const results = findArticles(BLOG_DIR).map(classify);
const byState = (state) => results.filter((r) => r.state === state);

const stale = byState("STALE");
const minor = byState("MINOR");
const unreadable = byState("UNREADABLE");
const untracked = byState("UNTRACKED");
const fresh = byState("FRESH");
const untranslated = byState("UNTRANSLATED");

// Only STALE and UNREADABLE are actionable. A missing translation is the normal state of this
// corpus (4 of 257 translated) and must never be reported as a problem.
const actionable = stale.length + unreadable.length;

if (!quiet || actionable > 0) {
  for (const item of stale) {
    console.log(
      `STALE      ${item.relative} — ${item.percent}% of translatable blocks changed`,
    );
  }
  for (const item of unreadable) {
    console.log(
      `UNREADABLE ${item.relative} — the .translation.json sidecar could not be parsed`,
    );
  }
}

if (!quiet) {
  for (const item of minor) {
    console.log(
      `minor      ${item.relative} — ${item.percent}% changed, below the ${Math.round(
        MINOR_DRIFT_THRESHOLD * 100,
      )}% threshold`,
    );
  }
  for (const item of untracked) {
    console.log(
      `untracked  ${item.relative} — translated but no sidecar, drift cannot be measured`,
    );
  }
  console.log(
    `\n${locale}: ${fresh.length} fresh · ${minor.length} minor · ${stale.length} stale · ` +
      `${untracked.length} untracked · ${untranslated.length} untranslated (of ${results.length})`,
  );
}

if (strict && actionable > 0) process.exit(1);
