/**
 * Discoverability affordance for the PWA (TODO 0090 follow-up): without this, a visitor has no
 * way to know the site is installable short of digging into Chrome's own overflow menu — Chrome
 * deprecated its automatic install banner on Android in favor of requiring the site to supply
 * its own UI, and only shows one at all once its own opaque engagement heuristic is satisfied
 * (repeat visits, time on site), which a first-time visitor never sees.
 *
 * `beforeinstallprompt` is Chromium-only (Chrome/Edge on Android and desktop) — Safari and
 * Firefox never fire it, so this pill simply never appears there. That's the known, accepted
 * gap already documented in TODO 0090 ("iOS reste une limite connue"), not a bug in this file.
 *
 * Mirrors `CommandPalette/Hint.tsx`'s pattern: shown at most once ever per browser (the
 * localStorage flag is set the moment it's *shown*, not only on dismiss/install), bottom-left
 * rather than that hint's bottom-right so the two can never stack on top of each other or the
 * bottom-right AskMyBlogWidget bubble.
 */

import { useEffect, useState, type JSX } from "react";
import styles from "./styles.module.css";

const STORAGE_KEY = "pwa_install_hint_shown";

// Not part of lib.dom.d.ts: the install-prompt event Chromium fires, and Safari's
// non-standard flag for "launched from the home screen".
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}

function isStandalone() {
  return (
    typeof window !== "undefined" &&
    (window.matchMedia?.("(display-mode: standalone)").matches ||
      // iOS Safari's own flag for "launched from the home screen" — no matching media
      // query exists there, but this pill never shows on iOS anyway (no
      // beforeinstallprompt); kept as a defensive no-op for the standalone case.
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}

export default function InstallPwaHint(): JSX.Element | null {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isStandalone() || localStorage.getItem(STORAGE_KEY)) return undefined;

    function onBeforeInstallPrompt(event: Event) {
      // Suppresses Chrome's own mini-infobar so this pill is the one, consistent UI —
      // the standard pattern for taking control of install timing (see web.dev's PWA
      // install guide).
      event.preventDefault();
      localStorage.setItem(STORAGE_KEY, "1");
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setVisible(true);
    }

    function onAppInstalled() {
      setVisible(false);
      setDeferredPrompt(null);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  if (!visible || !deferredPrompt) return null;

  return (
    <div className={styles.hintPill}>
      <button
        type="button"
        className={styles.hintButton}
        onClick={async () => {
          setVisible(false);
          await deferredPrompt.prompt();
          // The prompt can only be used once — whatever the reader chose, this
          // reference is now spent.
          setDeferredPrompt(null);
        }}
      >
        Install this site as an app
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
