/**
 * Pins the ENGLISH heading anchors onto a translated article.
 *
 * # Why
 *
 * Translating a heading changes the id Docusaurus derives from it, so every inbound link to
 * `#that-heading` breaks in the translated locale. The corpus itself only holds a handful of
 * such links, but the generated `/faq/` pages link to article headings by the hundred — which
 * is what the first `fr` build surfaced (14 broken anchors for 4 translated articles).
 *
 * Appending `{#english-slug}` to each translated heading keeps the ids stable, so every inbound
 * link keeps working, in both locales, with **no change whatsoever to the English corpus** —
 * `yarn write-heading-ids` over 257 articles is not needed and would be a massive invasive diff.
 *
 * # Why a deterministic post-pass rather than a prompt rule
 *
 * Same reasoning as translate-validate.mjs: asking the model to emit the right slug is asking it
 * to reimplement github-slugger by hand, on every heading, without ever slipping. Deriving them
 * here is exact, testable, and repairs translations that were produced before this existed.
 *
 * See TODO 0119.
 */

import GithubSlugger from "github-slugger";

const HEADING_RE = /^(#{1,6})\s+(.*?)\s*$/;
const EXPLICIT_ID_RE = /\s*\{#[^}]+\}\s*$/;

/** Splits a document into lines, marking which ones sit inside a fenced code block. */
function markFences(text) {
  let open = null;

  return text.split(/\r?\n/).map((line) => {
    const fence = line.match(/^\s*(`{3,}|~{3,})(.*)$/);
    if (fence) {
      const [, marker, rest] = fence;
      if (open && marker[0] === open[0] && marker.length >= open.length && !rest.trim()) {
        open = null;
      } else if (!open) {
        open = marker;
      }
      return { line, inFence: true };
    }
    return { line, inFence: Boolean(open) };
  });
}

/** Heading texts of a document, in order, ignoring anything inside a code fence. */
function headingTexts(text) {
  return markFences(text)
    .filter(({ line, inFence }) => !inFence && HEADING_RE.test(line))
    .map(({ line }) => line.match(HEADING_RE)[2]);
}

/**
 * Appends `{#english-slug}` to every heading of `translation`, using the slug Docusaurus would
 * have derived from the corresponding heading of `source`.
 *
 * Headings are matched by position, which is safe because translate-validate.mjs already
 * rejects any translation whose heading count or levels differ from the source.
 *
 * @returns {{content: string, pinned: number, skipped: string|null}} the rewritten document,
 *   how many anchors were pinned, and why nothing was done when that is the case.
 */
export function pinEnglishAnchors(source, translation) {
  const sourceHeadings = headingTexts(source);
  const translationHeadings = headingTexts(translation);

  if (sourceHeadings.length === 0) {
    return { content: translation, pinned: 0, skipped: "no headings" };
  }
  if (sourceHeadings.length !== translationHeadings.length) {
    return {
      content: translation,
      pinned: 0,
      skipped: `heading count differs (${sourceHeadings.length} vs ${translationHeadings.length})`,
    };
  }

  // One slugger for the whole document: github-slugger deduplicates repeated headings by
  // appending -1, -2, ... and Docusaurus relies on that same statefulness. Slugging the source
  // in document order is what reproduces its ids exactly.
  const slugger = new GithubSlugger();
  const slugs = sourceHeadings.map((heading) => slugger.slug(heading));

  let index = 0;
  let pinned = 0;

  const content = markFences(translation)
    .map(({ line, inFence }) => {
      if (inFence) return line;

      const match = line.match(HEADING_RE);
      if (!match) return line;

      const [, hashes, text] = match;
      const slug = slugs[index];
      index += 1;

      // An explicit id already present wins — the author put it there on purpose.
      if (EXPLICIT_ID_RE.test(text)) return line;

      pinned += 1;
      return `${hashes} ${text} {#${slug}}`;
    })
    .join("\n");

  return { content, pinned, skipped: null };
}
