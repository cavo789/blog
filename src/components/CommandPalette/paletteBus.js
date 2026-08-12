/**
 * Minimal pub-sub so independent trees (navbar SearchBar, 404 page, footer link, the
 * first-visit hint) can all open the one `<CommandPalette>` instance mounted once from
 * `src/theme/Root.js`, without threading a React Context through every swizzled theme
 * component and MDX page in between.
 */

let listener = null;

/** Called once, by the mounted `<CommandPalette>`, to receive open requests. */
export function registerPalette(onOpen) {
  listener = onOpen;
  return () => {
    if (listener === onOpen) listener = null;
  };
}

/** Opens the palette, optionally pre-filling the input (e.g. a failed 404 URL). */
export function openPalette(initialQuery = "") {
  listener?.(initialQuery);
}
