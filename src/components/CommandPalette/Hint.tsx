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
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Translate, { translate } from "@docusaurus/Translate";

const STORAGE_KEY = "cmdk_hint_shown";
const ARTICLE_DELAY_MS = 10_000;
const HOME_DELAY_MS = 4_000;
const ARTICLE_PATH = /^\/blog\/(?!tags|archive|authors|page)/;
const HOME_PATH = /^\/$/;

/**
 * Delay before showing the pill on this path, or `null` on a path that never shows it.
 *
 * `pathname` carries the locale's baseUrl (`/fr/`, `/fr/blog/x/`), while the patterns above are
 * written against the default locale. Stripping the prefix first is what keeps them working:
 * `/^\/$/` alone never matched `/fr/`, so the pill simply never appeared on the French home
 * page. See .claude/rules/i18n-locale-safety.md.
 */
function delayFor(pathname: string, baseUrl: string): number | null {
  const normalized =
    baseUrl !== "/" && pathname.startsWith(baseUrl)
      ? pathname.slice(baseUrl.length - 1)
      : pathname;

  if (HOME_PATH.test(normalized)) return HOME_DELAY_MS;
  if (ARTICLE_PATH.test(normalized)) return ARTICLE_DELAY_MS;
  return null;
}

function isMac(): boolean {
  return (
    typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform ?? "")
  );
}

export default function CommandPaletteHint() {
  const location = useLocation();
  const { siteConfig } = useDocusaurusContext();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return undefined;

    const delay = delayFor(location.pathname, siteConfig.baseUrl);
    if (delay === null) return undefined;

    const timer = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, "1");
      setVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [location.pathname, siteConfig.baseUrl]);

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
        <Translate
          id="palette.hintPill"
          values={{
            shortcut: (
              <>
                <kbd>{isMac() ? "⌘" : "Ctrl"}</kbd>+<kbd>K</kbd>
              </>
            ),
          }}
        >
          {"Press {shortcut} to search"}
        </Translate>
      </button>
      <button
        type="button"
        className={styles.hintDismiss}
        aria-label={translate({ id: "common.dismiss", message: "Dismiss" })}
        onClick={() => setVisible(false)}
      >
        ✕
      </button>
    </div>
  );
}
