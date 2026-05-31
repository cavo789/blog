/**
 * Converts a subset of Markdown to HTML string.
 * Handles: **bold**, *italic*, `code`, and [link](url).
 * Intended for use with dangerouslySetInnerHTML on trusted static content.
 */
export function parseMarkdown(text) {
  if (!text) return "";
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, "<code>$1</code>")
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
    );
}
