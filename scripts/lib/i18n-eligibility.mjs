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
 *   2. an ENGLISH sidecar already exists — if the author never wanted one in English, generating
 *      a French one invents content nobody asked for;
 *   3. the LOCALIZED sidecar is missing or stale — never regenerate what is already fresh.
 *
 * A checklist is a discipline; this module is a mechanism. See TODO 0120 and 0121.
 */

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const {
  collectTranslations,
} = require("../../plugins/translations-manifest-plugin/index.cjs");

const BLOG_DIR = "blog";

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
 * Source files eligible for a localized ELI5, with the reason each candidate was kept or not.
 *
 * @returns {{eligible: string[], skipped: {file: string, reason: string}[]}}
 */
export function eli5Candidates(projectRoot, locale) {
  const translated = translatedSlugs(projectRoot, locale);
  const eligible = [];
  const skipped = [];

  // Every file that already carries an English ELI5 — condition 2, applied first because it is
  // the cheapest filter and it eliminates most of the corpus.
  const englishSidecars = walk(
    path.join(projectRoot, BLOG_DIR),
    (name) => name.endsWith(".eli5.json") && !/\.eli5\.[a-z]{2}\.json$/.test(name),
  );

  for (const sidecar of englishSidecars) {
    const source = sidecar.replace(/\.eli5\.json$/, "");
    const articleDir = articleDirOf(sidecar, projectRoot);
    const slug = articleDir ? articleDir.split("/").pop() : null;

    if (!slug) {
      skipped.push({ file: source, reason: "not inside an article folder" });
      continue;
    }
    if (!translated.has(slug)) {
      skipped.push({
        file: source,
        reason: `article "${slug}" is not translated into ${locale}`,
      });
      continue;
    }

    const localized = `${source}.eli5.${locale}.json`;
    if (fs.existsSync(localized)) {
      const englishHash = readHash(sidecar);
      const localizedHash = readHash(localized);
      if (englishHash && englishHash === localizedHash) {
        skipped.push({ file: source, reason: "localized sidecar already fresh" });
        continue;
      }
    }

    eligible.push(source);
  }

  return { eligible, skipped };
}

function readHash(sidecarPath) {
  try {
    return JSON.parse(fs.readFileSync(sidecarPath, "utf-8")).sourceHash ?? null;
  } catch {
    return null;
  }
}

/**
 * Articles eligible for a localized question index: translated, and carrying an English
 * questions sidecar.
 */
export function questionCandidates(projectRoot, locale) {
  const translated = translatedSlugs(projectRoot, locale);
  const eligible = [];
  const skipped = [];

  const englishSidecars = walk(
    path.join(projectRoot, BLOG_DIR),
    (name) =>
      name.endsWith(".questions.json") && !/\.questions\.[a-z]{2}\.json$/.test(name),
  );

  for (const sidecar of englishSidecars) {
    const articleDir = articleDirOf(sidecar, projectRoot);
    const slug = articleDir ? articleDir.split("/").pop() : null;

    if (!slug || !translated.has(slug)) {
      skipped.push({
        file: sidecar,
        reason: `article "${slug ?? "?"}" is not translated`,
      });
      continue;
    }
    eligible.push(sidecar);
  }

  return { eligible, skipped };
}
