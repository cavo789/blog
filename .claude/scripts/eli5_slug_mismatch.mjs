#!/usr/bin/env node
/**
 * Are the articles whose folder name differs from their slug reachable by the localized ELI5
 * generator?
 *
 * 27 articles on this corpus set a `slug:` that differs from their folder name. That is legal and
 * intentional — but it is the seam where two ways of naming the same article meet, and any code
 * that derives a slug from a path instead of from the front matter goes wrong exactly there.
 *
 * It went wrong once: `eli5Candidates()` gated "is this article translated?" on the folder name
 * while `collectTranslations()` keyed on the front matter, so 16 translated articles — 73
 * snippets — were declared untranslated and skipped forever. Nothing failed: the Snippet loader
 * falls back to the English sidecar by design (TODO 0121), so the only symptom was a French
 * reader seeing English annotations, and `--dry-run` reporting "every snippet is up to date".
 *
 * This checks the MECHANISM rather than restating the prediction: it asks `eli5Candidates()`
 * itself, scoped to the mismatched articles, and fails if any of them is skipped for not being
 * translated. Re-implementing the gate here would just be a second copy of the thing that broke.
 *
 * Read-only: it calls no API, writes nothing, and costs nothing.
 *
 * Usage:
 *   node .claude/scripts/eli5_slug_mismatch.mjs [locale]   # default: fr
 *
 * Exit code 1 when the seam is broken again, so it can gate a CI step.
 */

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { eli5Candidates } from "../../scripts/lib/i18n-eligibility.mjs";

const require = createRequire(import.meta.url);
const {
  collectTranslations,
  slugFor,
} = require("../../plugins/translations-manifest-plugin/index.cjs");

const PROJECT_ROOT = path.resolve(import.meta.dirname, "..", "..");
const BLOG_DIR = path.join(PROJECT_ROOT, "blog");
const locale = process.argv[2] ?? "fr";

/** Every `index.md`/`index.mdx` under blog/, recursively. */
function articleFiles(directory, found = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) articleFiles(target, found);
    else if (/^index\.mdx?$/.test(entry.name)) found.push(target);
  }
  return found;
}

/** English ELI5 sidecars under an article's `files/` folder. */
function englishSidecarCount(articleDir) {
  const filesDir = path.join(articleDir, "files");
  if (!fs.existsSync(filesDir)) return 0;
  return fs
    .readdirSync(filesDir)
    .filter(
      (name) =>
        name.endsWith(".eli5.json") && !/\.eli5\.[a-z]{2}\.json$/.test(name),
    ).length;
}

const translated = new Set(collectTranslations(PROJECT_ROOT)[locale] ?? []);
const articles = articleFiles(BLOG_DIR);

// The seam: article folders whose name is not the slug the manifest filed them under.
const mismatched = [];
for (const article of articles) {
  const articleDir = path.dirname(article);
  const folder = path.basename(articleDir);
  const slug = slugFor(article);
  if (slug !== folder) {
    mismatched.push({
      key: path.relative(BLOG_DIR, articleDir).split(path.sep).join("/"),
      articleDir,
      folder,
      slug,
      translated: translated.has(slug),
      sidecars: englishSidecarCount(articleDir),
    });
  }
}

console.log(
  `Corpus: ${articles.length} article(s), ${translated.size} translated into "${locale}".`,
);
console.log(`Folder name ≠ front-matter slug: ${mismatched.length} article(s).`);

// Only those that actually have something to mirror can prove the gate works.
const testable = mismatched.filter((entry) => entry.translated && entry.sidecars > 0);
console.log(
  `Of those, ${testable.length} are translated AND carry English sidecars — the ones the gate must let through.\n`,
);

if (testable.length === 0) {
  console.log("Nothing to verify: no mismatched article has snippets to localize.");
  process.exit(0);
}

// Ask the real gate. A snippet is fine whether it comes back eligible (to generate) or skipped
// as already fresh — what must never happen is being skipped for not being translated.
const { eligible, skipped } = eli5Candidates(PROJECT_ROOT, locale, {
  articleKeys: testable.map((entry) => entry.key),
});

const unreachable = skipped.filter((entry) => /is not translated into/.test(entry.reason));

if (unreachable.length > 0) {
  console.log(
    `❌ The gate declares ${unreachable.length} snippet(s) untranslated although their article is:\n`,
  );
  for (const entry of unreachable) {
    console.log(`   ${path.relative(PROJECT_ROOT, entry.file)}\n      ${entry.reason}`);
  }
  console.log(
    `\nThe slug seam is broken again — scripts/lib/i18n-eligibility.mjs is deriving a slug from` +
      `\na path instead of borrowing slugFor() from the translations manifest.`,
  );
  process.exit(1);
}

const fresh = skipped.length;
console.log(`✅ The gate reaches every mismatched article.`);
console.log(`   ${eligible.length} snippet(s) awaiting generation, ${fresh} already fresh.`);
if (eligible.length > 0) {
  console.log(
    `\nGenerate them with:\n   node scripts/generate-eli5.mjs --locale ${locale} --articles \\\n` +
      testable.map((entry) => `     blog/${entry.key}`).join(" \\\n") +
      ` \\\n     --dry-run`,
  );
}
process.exit(0);
