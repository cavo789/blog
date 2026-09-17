/**
 * Freshness hashing for translations — hashes the TRANSLATABLE content, not the file.
 *
 * Hashing the whole file over-triggers: bumping `review_date`, adding a tag or fixing a line in a
 * Dockerfile shown via <Snippet> would all mark the translation stale although nothing
 * translatable moved. This strips everything the translator is forbidden to touch, so those edits
 * produce no drift at all.
 *
 * Reuses hashSource() from eli5-hash.mjs, whose header comment already anticipated this sharing.
 * See TODO 0119.
 */

import { hashSource } from "./eli5-hash.mjs";

const TRANSLATABLE_KEYS = new Set(["title", "description"]);

/** Reduces a document to the text a translator would actually rewrite. */
export function translatableContent(raw) {
  const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  let frontMatter = "";
  let body = raw;

  if (fmMatch) {
    body = raw.slice(fmMatch[0].length);
    frontMatter = fmMatch[1]
      .split(/\r?\n/)
      .filter((line) => {
        const pair = line.match(/^([A-Za-z_][\w-]*):/);
        return pair && TRANSLATABLE_KEYS.has(pair[1]);
      })
      .join("\n");
  }

  const stripped = body
    // Fenced code blocks: not translated, so not part of the hash.
    .replace(/^(\s*)(`{3,}|~{3,})[\s\S]*?^\s*\2\s*$/gm, "")
    // Inline code: idem.
    .replace(/`[^`\n]*`/g, "")
    // Identifier-carrying props: idem.
    .replace(/\b(?:source|href|to|icon|image|id|variant|language)=["'][^"']*["']/g, "")
    // Whitespace noise must not count as a change.
    .replace(/\s+/g, " ")
    .trim();

  return `${frontMatter}\n${stripped}`;
}

/** Content hash used by the sidecar and by check-translation-freshness.mjs. */
export function translatableHash(raw) {
  return hashSource(translatableContent(raw));
}

/**
 * Rough drift ratio between two versions of a source, in [0, 1], used to split "minor" from
 * "stale". Compares whitespace-normalised blocks rather than characters: one reworded sentence
 * in a 40-block article should read as 2.5%, not as a large character delta.
 */
export function driftRatio(oldRaw, newRaw) {
  const blocks = (raw) =>
    translatableContent(raw)
      .split(/(?<=[.!?])\s+/)
      .map((b) => b.trim())
      .filter(Boolean);

  const before = blocks(oldRaw);
  const after = new Set(blocks(newRaw));
  if (before.length === 0) return after.size === 0 ? 0 : 1;

  const unchanged = before.filter((b) => after.has(b)).length;
  return 1 - unchanged / Math.max(before.length, after.size);
}
