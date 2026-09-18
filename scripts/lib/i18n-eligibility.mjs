/**
 * Which files may a localized generator touch?
 *
 * Every AI-powered sidecar generator on this repo (ELI5 annotations, "Ask my blog" questions)
 * costs money per file. Running one over the whole corpus in a non-default locale would spend
 * far more than translating the articles themselves — 1280 snippets across 311 files, against
 * 257 articles.
 *
 * Three conditions gate eligibility, and they are enforced here rather than restated as a
 * checklist in each script:
 *
 *   1. the ARTICLE is really translated into that locale (Docusaurus's i18n falls back to the
 *      English source, so a `/fr/` route existing proves nothing);
 *   2. an ENGLISH sidecar already exists AND is not an `{"excluded": true}` marker — if the
 *      author never wanted one in English, generating a French one invents content nobody
 *      asked for, and the marker is how that refusal is recorded;
 *   3. the LOCALIZED sidecar is missing or stale — never regenerate what is already fresh.
 *
 * A checklist is a discipline; this module is a mechanism. See TODO 0120 and 0121.
 */

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { hashSource } from "./eli5-hash.mjs";

const require = createRequire(import.meta.url);
const {
  collectTranslations,
  slugFor,
} = require("../../plugins/translations-manifest-plugin/index.cjs");

const BLOG_DIR = "blog";
const I18N_BLOG_DIR = "docusaurus-plugin-content-blog";

/**
 * Rough per-file cost of one localized ELI5, measured on this corpus (claude-haiku-4-5).
 *
 * Deliberately pessimistic: the token arithmetic over the 723 eligible files lands nearer
 * $0.002 each. It lives here rather than in `i18n-budget.mjs` because `translate` quotes the
 * same number before spending — two copies of a price is how the two prompts start disagreeing.
 */
export const ELI5_COST_PER_FILE = 0.01;

/** Recursively collects every file under a directory matching a predicate. */
function walk(directory, keep) {
  if (!fs.existsSync(directory)) return [];

  const found = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) found.push(...walk(target, keep));
    else if (keep(entry.name, target)) found.push(target);
  }
  return found;
}

/**
 * The slug the translations manifest filed an article under — its front matter's `slug:`, not
 * its folder name.
 *
 * The two agree for most of the corpus, which is why keying on the folder name looked right for
 * as long as it did. Where they disagree the manifest lookup misses, the article is declared
 * untranslated, and its snippets are skipped in silence — the Snippet loader then falls back to
 * the English sidecar (TODO 0121), so nothing ever fails loudly. `slugFor` is borrowed from the
 * manifest plugin on purpose: a second local copy of "how do I get a slug from a path" is what
 * produced the bug in the first place.
 *
 * @returns {string|null} null when no `index.md`/`index.mdx` sits in that folder.
 */
function articleSlugOf(projectRoot, articleDir, cache) {
  if (cache.has(articleDir)) return cache.get(articleDir);

  let slug = null;
  for (const name of ["index.md", "index.mdx"]) {
    const candidate = path.join(projectRoot, BLOG_DIR, articleDir, name);
    if (fs.existsSync(candidate)) {
      slug = slugFor(candidate);
      break;
    }
  }

  cache.set(articleDir, slug);
  return slug;
}

/** The article folder a file belongs to, e.g. `blog/2026/09/14/atuin-bash-history`. */
function articleDirOf(filePath, projectRoot) {
  const relative = path.relative(path.join(projectRoot, BLOG_DIR), filePath);
  const parts = relative.split(path.sep);
  // blog/YYYY/MM/DD/<slug>/… — the slug is the fourth segment.
  return parts.length >= 5 ? parts.slice(0, 4).join("/") : null;
}

/** @returns {Set<string>} slugs of articles really translated into `locale`. */
export function translatedSlugs(projectRoot, locale) {
  return new Set(collectTranslations(projectRoot)[locale] ?? []);
}

/**
 * The `YYYY/MM/DD/slug` key of whatever article a path belongs to — an `index.md`, a snippet
 * under `files/`, a sidecar. Exported so a caller holding article paths (the `translate`
 * cheatsheet function, which knows what it just translated) can scope `eli5Candidates` to them
 * without re-deriving how this repo lays articles out.
 *
 * @returns {string|null} null when the path is not inside an article folder.
 */
export function articleKeyOf(projectRoot, filePath) {
  const relative = path.relative(
    path.join(projectRoot, BLOG_DIR),
    path.resolve(filePath),
  );
  if (relative.startsWith("..")) return null;

  const parts = relative.split(path.sep);
  // Four segments is the article FOLDER itself (`blog/2026/09/17/docling`), more is something
  // inside it (`index.md`, `files/Dockerfile`). `articleDirOf` above demands five because it
  // only ever sees sidecars; a caller naming an article legitimately passes either shape.
  return parts.length >= 4 ? parts.slice(0, 4).join("/") : null;
}

/**
 * Source files eligible for a localized ELI5, with the reason each candidate was kept or not.
 *
 * @param {object} [options]
 * @param {Iterable<string>} [options.articleKeys] restrict the scan to these articles
 *   (`YYYY/MM/DD/slug`, as `articleKeyOf` returns). Omit for the whole corpus. A run right
 *   after translating one article must not pay to re-scan — or re-report — the other 256.
 * @param {boolean} [options.assumeTranslated] treat the scoped articles as already translated.
 *   For quoting a price BEFORE the translation runs: condition 1 is exactly what the imminent
 *   `translate` is about to make true, so applying it would quote $0.00 for every new article
 *   and then bill for it afterwards. Meaningless — and ignored — without `articleKeys`.
 * @returns {{eligible: string[], skipped: {file: string, reason: string}[]}}
 */
export function eli5Candidates(
  projectRoot,
  locale,
  { articleKeys, assumeTranslated = false } = {},
) {
  const translated = translatedSlugs(projectRoot, locale);
  const scope = articleKeys ? new Set(articleKeys) : null;
  const skipCondition1 = assumeTranslated && scope !== null;
  const eligible = [];
  const skipped = [];
  // One front-matter read per article folder, not per sidecar: htaccess alone carries 29.
  const slugCache = new Map();

  // Every file that already carries an English ELI5 — condition 2, applied first because it is
  // the cheapest filter and it eliminates most of the corpus.
  const englishSidecars = walk(
    path.join(projectRoot, BLOG_DIR),
    (name) => name.endsWith(".eli5.json") && !/\.eli5\.[a-z]{2}\.json$/.test(name),
  );

  for (const sidecar of englishSidecars) {
    const source = sidecar.replace(/\.eli5\.json$/, "");
    const articleDir = articleDirOf(sidecar, projectRoot);

    // A snippet the author declared deliberately unannotated (check-eli5-freshness.mjs's
    // escape hatch). The file exists, so condition 2 reads as satisfied — but there is no
    // English annotation to translate, and billing for a French one would resurrect in fr
    // exactly what was refused in en.
    if (isExcluded(sidecar)) {
      skipped.push({ file: source, reason: "annotation deliberately excluded" });
      continue;
    }

    // Out of scope is not the same as skipped: a caller asking about one article wants
    // "2 eligible", not "2 eligible, 796 skipped" drowning it.
    if (scope && !scope.has(articleDir)) continue;

    const slug = articleDir ? articleSlugOf(projectRoot, articleDir, slugCache) : null;

    if (!slug) {
      skipped.push({ file: source, reason: "not inside an article folder" });
      continue;
    }
    if (!skipCondition1 && !translated.has(slug)) {
      skipped.push({
        file: source,
        reason: `article "${slug}" is not translated into ${locale}`,
      });
      continue;
    }

    // Condition 3, measured against the CODE — not against the English sidecar's recorded hash.
    // Both sidecars hash the same source file, so comparing them looks equivalent, but it makes
    // French freshness hostage to English bookkeeping: the one legacy English sidecar carrying
    // no `sourceHash` (generated before hashing existed) never compares equal, so its French
    // counterpart was re-generated — and re-billed — on every single run, forever. An English
    // sidecar that has merely drifted would do the same.
    const localized = `${source}.eli5.${locale}.json`;
    if (fs.existsSync(localized)) {
      const localizedHash = readHash(localized);
      if (localizedHash && localizedHash === currentHashOf(source)) {
        skipped.push({ file: source, reason: "localized sidecar already fresh" });
        continue;
      }
    }

    eligible.push(source);
  }

  return { eligible, skipped };
}

/** Does this sidecar declare the snippet deliberately unannotated? */
function isExcluded(sidecarPath) {
  try {
    return JSON.parse(fs.readFileSync(sidecarPath, "utf-8")).excluded === true;
  } catch {
    return false;
  }
}

function readHash(sidecarPath) {
  try {
    return JSON.parse(fs.readFileSync(sidecarPath, "utf-8")).sourceHash ?? null;
  } catch {
    return null;
  }
}

/** Hash of the source file as it stands right now, or null if it cannot be read. */
function currentHashOf(sourcePath) {
  try {
    return hashSource(fs.readFileSync(sourcePath, "utf-8"));
  } catch {
    return null;
  }
}

/** Where the translation of a `blog/` file lives, e.g. `i18n/fr/docusaurus-plugin-content-blog/…`. */
export function localizedBlogPath(projectRoot, blogFile, locale) {
  const relative = path.relative(path.join(projectRoot, BLOG_DIR), blogFile);
  return path.join(projectRoot, "i18n", locale, I18N_BLOG_DIR, relative);
}

/**
 * Translated articles eligible for a localized question index.
 *
 * The localized sidecar lives next to the TRANSLATED article
 * (`i18n/<locale>/docusaurus-plugin-content-blog/<rel>/index.md.questions.json`), because it is
 * generated from that file: the questions must match the text and the heading anchors the
 * reader actually sees. Its `sourceHash` is therefore the hash of the translated file, and a
 * retranslation makes it stale.
 *
 * "Translated" is decided by the translated file existing at the mirrored path — the same test
 * `translations-manifest-plugin` applies — rather than by slug, which would need the front
 * matter slug and the folder name to agree.
 *
 * @returns {{eligible: string[], skipped: {file: string, reason: string}[]}} `eligible` holds
 *   the translated article paths to generate from.
 */
export function questionCandidates(projectRoot, locale) {
  const eligible = [];
  const skipped = [];

  const englishSidecars = walk(path.join(projectRoot, BLOG_DIR), (name) =>
    /^index\.mdx?\.questions\.json$/.test(name),
  );

  for (const sidecar of englishSidecars) {
    const article = sidecar.replace(/\.questions\.json$/, "");
    const translated = localizedBlogPath(projectRoot, article, locale);

    if (!fs.existsSync(translated)) {
      skipped.push({ file: article, reason: `not translated into ${locale}` });
      continue;
    }

    // Condition 2, refined: an article excluded during review (questions-review.mjs) or left
    // with an empty list carries no English questions on purpose — nothing to mirror.
    const english = readJson(sidecar);
    if (english?.excluded === true || !english?.questions?.length) {
      skipped.push({ file: article, reason: "English sidecar excluded or empty" });
      continue;
    }

    // Condition 3.
    const localized = readJson(`${translated}.questions.json`);
    if (localized?.excluded === true) {
      skipped.push({
        file: translated,
        reason: "localized sidecar excluded during review",
      });
      continue;
    }
    if (
      localized &&
      localized.sourceHash === hashSource(fs.readFileSync(translated, "utf-8"))
    ) {
      skipped.push({ file: translated, reason: "localized sidecar already fresh" });
      continue;
    }

    eligible.push(translated);
  }

  return { eligible, skipped };
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return null;
  }
}
