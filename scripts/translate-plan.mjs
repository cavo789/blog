#!/usr/bin/env node
/**
 * Decide, offline and for free, what a `translate <path>` run would actually do.
 *
 * Usage:
 *   node scripts/translate-plan.mjs [--porcelain] [--force] [--repair] [--locale fr] <path>...
 *
 * `<path>` is an article file, an article folder, or any folder above it — same resolution as
 * the `translate` shell function, so the plan can be computed for `blog/2024` as easily as for
 * a single post.
 *
 * Why this exists: `translate blog/2024` used to announce "108 articles — about 17.28 $" even
 * when all 108 were already translated and the run would have cost nothing. The skip decision
 * lived inside translate-post.mjs, one article at a time, so the prompt had no way to know it.
 * This script replays exactly the same decisions up front — hash comparison, patch-vs-full
 * drift ceiling, and (under `--repair`) the validator itself — without ever constructing the
 * Anthropic client. Nothing here can spend money.
 *
 * Each article lands in one state, and the state decides the estimate:
 *
 *   UP_TO_DATE  the sidecar hash still matches — no API call at all, 0 $
 *   NEW         no translation yet — full translation
 *   UNTRACKED   translated but no sidecar to diff against — full translation
 *   PATCH       changed under the drift ceiling — incremental edits, the cheap path
 *   FULL        changed past the ceiling (or --force) — full retranslation
 *   REPAIR      --repair only: the stored translation fails the validator
 *   CLEAN       --repair only: the stored translation passes every check, 0 $
 *   MISSING     --repair only: nothing to repair, no translation exists
 *
 * Output is human-readable by default; `--porcelain` prints one `STATE<TAB>COST<TAB>PATH` line
 * per article, which is what the `translate` function consumes to build its confirmation
 * prompt. Keeping the costs here means the shell has no cost table of its own to drift from.
 *
 * See TODO 0119 / 0124.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { validateTranslation } from "./lib/translate-validate.mjs";
import { translatableHash, driftRatio } from "./lib/translate-hash.mjs";
import { MAX_PATCH_DRIFT } from "./lib/translate-patch.mjs";

const require = createRequire(import.meta.url);
const {
  collectSourceFrontMatter,
} = require("../plugins/translations-manifest-plugin/index.cjs");
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const DEFAULT_TARGET_LOCALE = "fr";

/**
 * Measured on Opus 5 (TODO 0119): 0.16 $ for a whole article, 0.055 $ for an incremental patch.
 * A repair sends the validator's findings plus the current French, so it costs roughly half a
 * full pass. These are estimates for a confirmation prompt, never a budget that gets enforced.
 */
const COST = { FULL: 0.16, PATCH: 0.055, REPAIR: 0.08 };

function parseArgs(argv) {
  const positional = [];
  let force = false;
  let repair = false;
  let porcelain = false;
  let locale = DEFAULT_TARGET_LOCALE;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--force") force = true;
    else if (arg === "--repair") repair = true;
    else if (arg === "--porcelain") porcelain = true;
    else if (arg === "--locale") locale = argv[++i];
    // `--model <id>` and friends are meaningless here but are part of the command line the
    // caller was given: consume the value, ignore the flag, rather than treating it as a path.
    else if (arg === "--model") i += 1;
    else if (arg.startsWith("--")) continue;
    else positional.push(arg);
  }
  return { paths: positional, force, repair, porcelain, locale };
}

/** Every index.md/index.mdx at or under `target`, sorted — the shell function's resolution. */
function resolveArticles(target) {
  const absolute = path.resolve(projectRoot, target);

  if (!fs.existsSync(absolute)) {
    console.error(`❌ Not found: ${target}`);
    process.exit(1);
  }
  if (fs.statSync(absolute).isFile()) return [absolute];

  const found = [];
  for (const entry of fs.readdirSync(absolute, { withFileTypes: true })) {
    const child = path.join(absolute, entry.name);
    if (entry.isDirectory()) found.push(...resolveArticles(child));
    else if (entry.name === "index.md" || entry.name === "index.mdx") found.push(child);
  }
  return found.sort();
}

function targetPathFor(sourcePath, locale) {
  const relative = path.relative(path.join(projectRoot, "blog"), sourcePath);
  return path.join(
    projectRoot,
    `i18n/${locale}/docusaurus-plugin-content-blog`,
    relative,
  );
}

/**
 * Mirrors main() in translate-post.mjs: same order of decisions, same thresholds. If that file's
 * skip logic changes, this one has to follow — that is the price of announcing a cost before
 * spending it.
 */
function classify(sourceFile, { force, repair, locale, validationContext }) {
  const target = targetPathFor(sourceFile, locale);
  const sidecarPath = `${target}.translation.json`;
  const source = fs.readFileSync(sourceFile, "utf-8");

  if (repair) {
    if (!fs.existsSync(target)) return { state: "MISSING", cost: 0 };
    const problems = validateTranslation(
      source,
      fs.readFileSync(target, "utf-8"),
      validationContext,
    );
    return problems.length === 0
      ? { state: "CLEAN", cost: 0 }
      : { state: "REPAIR", cost: COST.REPAIR, detail: `${problems.length} problem(s)` };
  }

  let sidecar = null;
  if (!force && fs.existsSync(sidecarPath)) {
    try {
      sidecar = JSON.parse(fs.readFileSync(sidecarPath, "utf-8"));
    } catch {
      sidecar = null; // Unreadable sidecar: translate-post.mjs would throw; a full pass is the honest estimate.
    }
  }

  if (!fs.existsSync(target)) return { state: "NEW", cost: COST.FULL };
  if (!sidecar) return { state: force ? "FULL" : "UNTRACKED", cost: COST.FULL };
  if (sidecar.sourceHash === translatableHash(source))
    return { state: "UP_TO_DATE", cost: 0 };
  if (!sidecar.source) return { state: "FULL", cost: COST.FULL };

  const drift = driftRatio(sidecar.source, source);
  const percent = `${(drift * 100).toFixed(1)}% drift`;
  return drift < MAX_PATCH_DRIFT
    ? { state: "PATCH", cost: COST.PATCH, detail: percent }
    : { state: "FULL", cost: COST.FULL, detail: percent };
}

const { paths, force, repair, porcelain, locale } = parseArgs(process.argv.slice(2));

if (paths.length === 0) {
  console.error(
    "Usage: node scripts/translate-plan.mjs [--porcelain] [--force] [--repair] [--locale fr] <path>...",
  );
  process.exit(1);
}

const articles = [...new Set(paths.flatMap(resolveArticles))];
if (articles.length === 0) {
  console.error(`❌ No article found under: ${paths.join(" ")}`);
  process.exit(1);
}

// Only --repair reads the corpus front matter (check 11 needs the English titles); building it
// for a plain plan would cost a full corpus scan for nothing.
const validationContext = repair
  ? {
      sourceTitles: Object.fromEntries(
        Object.entries(collectSourceFrontMatter(projectRoot)).map(([slug, meta]) => [
          slug,
          meta.title,
        ]),
      ),
    }
  : {};

const plan = articles.map((file) => ({
  file: path.relative(projectRoot, file),
  ...classify(file, { force, repair, locale, validationContext }),
}));

if (porcelain) {
  for (const item of plan) {
    process.stdout.write(`${item.state}\t${item.cost.toFixed(4)}\t${item.file}\n`);
  }
  process.exit(0);
}

const cost = plan.reduce((total, item) => total + item.cost, 0);
const counts = plan.reduce((acc, item) => {
  acc[item.state] = (acc[item.state] ?? 0) + 1;
  return acc;
}, {});

for (const item of plan.filter((entry) => entry.cost > 0)) {
  console.log(
    `${item.state.padEnd(10)} ${item.file}${item.detail ? ` — ${item.detail}` : ""}`,
  );
}

const summary = Object.entries(counts)
  .map(([state, n]) => `${n} ${state.toLowerCase()}`)
  .join(" · ");
console.log(
  `\n${locale}: ${summary} (of ${plan.length}) — about ${cost.toFixed(2)} $ if translated now.`,
);
