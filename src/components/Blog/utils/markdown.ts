/**
 * Converts a subset of Markdown to HTML string.
 * Handles: **bold**, *italic*, `code`, and [link](url).
 * Intended for use with dangerouslySetInnerHTML on trusted static content.
 *
 * Raw HTML outside code spans passes through on purpose — some StepsCard items use <a> and <kbd>.
 * Code spans are the exception: their content is literal text, so it is HTML-escaped. Without
 * that, `ollama show <model>` or `<!doctype html>` reached the page as markup — the browser
 * swallowed them as unknown tags (the words vanished from the step) and the SSG minifier flagged
 * the page on every deploy. Code spans are also handled FIRST and parked behind placeholders, so
 * the bold/italic rules can no longer rewrite the `*` in `rm *Zone.Identifier`.
 */
const escapeHtml = (value: string): string =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// A private-use code point: never present in authored text, and — unlike \u0000 — harmless in
// HTML should a placeholder ever survive.
const PARK = "\uE000";

export function parseMarkdown(text: string | null | undefined): string {
  if (!text) return "";

  const codeSpans: string[] = [];
  const parked = text.replace(/`([^`]*)`/g, (_match, code: string) => {
    codeSpans.push(`<code>${escapeHtml(code)}</code>`);
    return `${PARK}${codeSpans.length - 1}${PARK}`;
  });

  return parked
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
    )
    .replace(new RegExp(`${PARK}(\\d+)${PARK}`, "g"), (_match, index: string) => codeSpans[Number(index)]);
}
