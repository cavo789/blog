/**
 * @fileoverview
 * Docusaurus Remark Plugin – remark-replace-words
 *
 * This plugin is designed for use with Docusaurus to automatically correct the casing
 * of common technology terms in Markdown content. It scans Markdown AST text nodes and
 * replaces lowercase variants like "github" or "markdown" with their properly capitalized
 * forms ("GitHub", "Markdown", etc.).
 *
 * ⚠️ Replacements are skipped inside links, images, and code blocks to avoid unintended changes.
 * 🧠 Compound words (e.g., "vscode-docker") are also preserved.
 *
 * Intended for use in the Docusaurus Markdown pipeline via `remarkPlugins`.
 *
 * @module remarkReplaceWords
 * @returns {Function} A remark transformer function
 */

const { visit } = require("unist-util-visit");

// Define replacements as [searchRegex, replacement]
const replacements = [
  [/\bdocusaurus\b/g, "Docusaurus"],
  [/\bgithub\b/g, "GitHub"],
  [/\bmarkdown\b/g, "Markdown"],
  [/\bvscode\b/g, "VSCode"],
];

// A heading's explicit anchor id — `## Docusaurus {#docusaurus}` — is still ordinary text when
// this plugin runs: it sits in `beforeDefaultRemarkPlugins`, so Docusaurus parses that `{#id}`
// suffix only afterwards. Capitalizing a term inside it rewrites the id itself (`{#Docusaurus}`),
// and every link built from the English slug then points at an anchor the page no longer has —
// which is exactly how the `fr` build died on "broken anchors". Ids are never prose: skip them.
// Translated articles carry one on every heading (see scripts/lib/translate-anchors.mjs).
const EXPLICIT_HEADING_ID = /\{#[^}\s]*\}/g;

/** Applies `transform` to `value`, leaving every explicit `{#heading-id}` untouched. */
function outsideHeadingIds(value, transform) {
  const parts = [];
  let cursor = 0;

  for (const match of value.matchAll(EXPLICIT_HEADING_ID)) {
    parts.push(transform(value.slice(cursor, match.index)), match[0]);
    cursor = match.index + match[0].length;
  }
  parts.push(transform(value.slice(cursor)));

  return parts.join("");
}

function remarkReplaceWords() {
  return (tree) => {
    visit(tree, "text", (node, index, parent) => {
      if (typeof node.value !== "string") return;

      // Skip inside certain node types (URLs, code, etc.)
      const forbiddenParents = ["link", "image", "inlineCode", "code"];
      if (parent && forbiddenParents.includes(parent.type)) {
        return;
      }

      node.value = outsideHeadingIds(node.value, (text) => {
        let result = text;

        for (const [regex, replacement] of replacements) {
          result = result.replace(regex, (match, offset, fullString) => {
            const before = fullString[offset - 1] || "";
            const after = fullString[offset + match.length] || "";

            // Skip compound words like "vscode-docker", "foo.markdown"
            if (["-", ".", "/"].includes(before) || ["-", ".", "/"].includes(after)) {
              return match;
            }

            return replacement;
          });
        }

        return result;
      });
    });
  };
}

module.exports = remarkReplaceWords;
