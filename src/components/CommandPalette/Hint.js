/**
 * First-visit discoverability hint for the command palette (TODO 0084): after a short delay, a
 * small dismissible pill appears bottom-right — "Press ⌘K to search". Shown at most once, ever,
 * per browser: the localStorage flag is set the moment it's *shown*, not only on dismiss, so a
 * visitor who never interacts with it doesn't see it again on their next article either.
 *
 * Shown on articles and on the homepage, with a different delay for each (TODO 0089). On an
 * article the 10s wait exists so the pill never interrupts someone who just started reading; the
 * homepage has no reading to interrupt and is where visitors arrive and bounce fastest, so it
 * gets a shorter one — still long enough not to read as a load-time pop-up.
 */

import { useEffect, useState } from "react";
import { useLocation } from "@docusaurus/router";
import { openPalette } from "./paletteBus";
import styles from "./styles.module.css";

const STORAGE_KEY = "cmdk_hint_shown";
const ARTICLE_DELAY_MS = 10_000;
const HOME_DELAY_MS = 4_000;
const ARTICLE_PATH = /^\/blog\/(?!tags|archive|authors|page)/;
const HOME_PATH = /^\/$/;

/** Delay before showing the pill on this path, or `null` on a path that never shows it. */
function delayFor(pathname) {
  if (HOME_PATH.test(pathname)) return HOME_DELAY_MS;
  if (ARTICLE_PATH.test(pathname)) return ARTICLE_DELAY_MS;
  return null;
}

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

    const delay = delayFor(location.pathname);
    if (delay === null) return undefined;

    const timer = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, "1");
      setVisible(true);
    }, delay);

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
