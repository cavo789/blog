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

function remarkReplaceWords() {
  return (tree, file) => {
    visit(tree, "text", (node, index, parent) => {
      if (typeof node.value !== "string") return;

      // Skip inside certain node types (URLs, code, etc.)
      const forbiddenParents = ["link", "image", "inlineCode", "code"];
      if (parent && forbiddenParents.includes(parent.type)) {
        return;
      }

      let original = node.value;

      for (const [regex, replacement] of replacements) {
        node.value = node.value.replace(regex, (match, offset, fullString) => {
          const before = fullString[offset - 1] || "";
          const after = fullString[offset + match.length] || "";

          // Skip compound words like "vscode-docker", "foo.markdown"
          if (
            ["-", ".", "/"].includes(before) ||
            ["-", ".", "/"].includes(after)
          ) {
            return match;
          }

          // console.log(
          //   `🔎 Replacing '${match}' with '${replacement}' in file: ${file.path}\nSentence: ${fullString}`
          // );
          return replacement;
        });
      }
    });
  };
}

module.exports = remarkReplaceWords;
