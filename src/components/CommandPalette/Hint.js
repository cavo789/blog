/**
 * First-visit discoverability hint for the command palette (TODO 0084): after ~10s reading
 * an article, a small dismissible pill appears bottom-right — "Press ⌘K to search". Shown at
 * most once, ever, per browser: the localStorage flag is set the moment it's *shown*, not
 * only on dismiss, so a visitor who never interacts with it doesn't see it again on their
 * next article either.
 */

import { useEffect, useState } from "react";
import { useLocation } from "@docusaurus/router";
import { openPalette } from "./paletteBus";
import styles from "./styles.module.css";

const STORAGE_KEY = "cmdk_hint_shown";
const DELAY_MS = 10_000;
const ARTICLE_PATH = /^\/blog\/(?!tags|archive|authors|page)/;

function isMac() {
  return (
    typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform ?? "")
  );
}

export default function CommandPaletteHint() {
  const location = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return undefined;
    if (!ARTICLE_PATH.test(location.pathname)) return undefined;

    const timer = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, "1");
      setVisible(true);
    }, DELAY_MS);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (!visible) return null;

  return (
    <div className={styles.hintPill}>
      <button
        type="button"
        className={styles.hintButton}
        onClick={() => {
          setVisible(false);
          openPalette();
        }}
      >
        Press <kbd>{isMac() ? "⌘" : "Ctrl"}</kbd>+<kbd>K</kbd> to search
      </button>
      <button
        type="button"
        className={styles.hintDismiss}
        aria-label="Dismiss"
        onClick={() => setVisible(false)}
      >
        ✕
      </button>
    </div>
  );
}
