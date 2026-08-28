/**
 * Minimal pub-sub so independent trees (navbar SearchBar, 404 page, footer link, the
 * first-visit hint) can all open the one `<CommandPalette>` instance mounted once from
 * `src/theme/Root.js`, without threading a React Context through every swizzled theme
 * component and MDX page in between.
 */

type OpenListener = (initialQuery: string) => void;

let listener: OpenListener | null = null;

/** Called once, by the mounted `<CommandPalette>`, to receive open requests. */
export function registerPalette(onOpen: OpenListener): () => void {
  listener = onOpen;
  return () => {
    if (listener === onOpen) listener = null;
  };
}

/** Opens the palette, optionally pre-filling the input (e.g. a failed 404 URL). */
export function openPalette(initialQuery = ""): void {
  listener?.(initialQuery);
}

// ── Cross-overlay mutual exclusion ────────────────────────────────────────────────────────
//
// The command palette and the Ask-my-blog bubble panel (AskMyBlogWidget) are independent
// floating dialogs, each triggerable from several places, but only one should ever be open at
// once. Whichever opens second closes whichever was open first — both sides just call
// `setActiveOverlay(close)` when they open, and the `clear` closure it returns when they
// close, neither needs to know the other exists.
let activeCloser: (() => void) | null = null;

export function setActiveOverlay(closeFn: () => void): () => void {
  if (activeCloser && activeCloser !== closeFn) activeCloser();
  activeCloser = closeFn;
  return () => {
    if (activeCloser === closeFn) activeCloser = null;
  };
}
