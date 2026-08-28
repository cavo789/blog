/**
 * Swizzled `@theme/SearchBar` (TODO 0084): replaces `docusaurus-plugin-pagefind`'s own
 * DocSearch-style modal — which owns its own `Ctrl+K`/`Cmd+K` binding — with a plain button
 * that opens the site-wide command palette instead. The palette's own `/` mode still runs
 * real Pagefind full-text search (`../../components/CommandPalette/utils.ts`), so the search
 * engine isn't lost, only its dedicated modal — "replace it, don't double it", per the TODO's
 * constraints.
 *
 * A real-looking search box in the navbar ("🔍 Search 248 articles… ⌘K") converts far better
 * than an icon-only button — see the TODO's "Découvrabilité" section.
 */

import { usePluginData } from "@docusaurus/useGlobalData";
import { openPalette } from "@site/src/components/CommandPalette/paletteBus";
import styles from "./styles.module.css";

function isMac() {
  return (
    typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform ?? "")
  );
}

export default function SearchBar() {
  const navIndex = usePluginData("command-palette-plugin");
  const count = navIndex?.meta?.articleCount;

  return (
    <button
      type="button"
      className={styles.button}
      onClick={() => openPalette()}
      aria-label="Search"
    >
      <span className={styles.icon} aria-hidden="true">
        🔍
      </span>
      <span className={styles.placeholder}>
        {count ? `Search ${count} articles…` : "Search…"}
      </span>
      <span className={styles.shortcut}>{isMac() ? "⌘K" : "Ctrl K"}</span>
    </button>
  );
}
