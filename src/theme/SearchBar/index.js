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
import { translate } from "@docusaurus/Translate";
import { useTranslationState } from "@site/src/components/Blog/utils/translations";

function isMac() {
  return (
    typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform ?? "")
  );
}

export default function SearchBar() {
  const navIndex = usePluginData("command-palette-plugin");
  const { isDefaultLocale } = useTranslationState();

  // The count is a selling point — "Search 248 articles…" is what makes this read as a real
  // search box rather than a button (see the docblock above). `articleCount` is locale-filtered,
  // so under a partially translated locale the same lever works backwards: "Rechercher dans 4
  // articles…", printed on every page, advertises the blog as tiny. The figure is accurate — the
  // Pagefind index really does hold four French articles — which is why the fix is to drop the
  // number rather than correct it. The shortfall is stated where it belongs, once per page, by
  // <TranslationCoverage />.
  const count = isDefaultLocale ? navIndex?.meta?.articleCount : undefined;

  return (
    <button
      type="button"
      className={styles.button}
      onClick={() => openPalette()}
      aria-label={translate({ id: "theme.searchBar.ariaLabel", message: "Search" })}
    >
      <span className={styles.icon} aria-hidden="true">
        🔍
      </span>
      <span className={styles.placeholder}>
        {count
          ? translate(
              { id: "theme.searchBar.withCount", message: "Search {count} articles…" },
              { count },
            )
          : translate({ id: "theme.searchBar.empty", message: "Search…" })}
      </span>
      <span className={styles.shortcut}>{isMac() ? "⌘K" : "Ctrl K"}</span>
    </button>
  );
}
