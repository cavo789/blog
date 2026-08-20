import React, { useEffect, useRef, useState } from "react";
import styles from "./styles.module.css";

/**
 * Replaces the browser's bare "no internet" interstitial with an in-app message when an
 * offline reader taps a link the service worker never cached.
 *
 * Deliberately does NOT touch the service worker. `docusaurus.config.js`'s `plugin-pwa` entry
 * (and .todos/PARTIAL/PARTIAL_0095-pwa-lecture-hors-ligne.md) document why: a `swCustom` route
 * added there is loaded via a real `await import(...)` inside the generated `sw.js`, which can
 * fail across a service-worker respawn and — verified with Playwright — breaks the plugin's own
 * fetch listener that reliably serves the cached homepage shell. Anything added there risks the
 * one thing that already works.
 *
 * This instead intercepts link clicks in the already-loaded page, in the capture phase (ahead of
 * Docusaurus's own <Link>, so calling preventDefault() here also cancels its client-side
 * transition), and only when the browser is offline. It checks the Cache Storage entry the
 * service worker itself populated (so it automatically stays correct if the precached shell ever
 * grows) — a hit lets the navigation through, a miss shows a dismissible notice instead of
 * letting the tab sail into a dead network request.
 */
export default function OfflineNotice() {
  const [message, setMessage] = useState(null);
  const dismissTimer = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("caches" in window)) {
      return undefined;
    }

    const dismiss = () => setMessage(null);

    const handleClick = (event) => {
      if (navigator.onLine) return;

      const link = event.target.closest("a[href]");
      if (!link) return;

      const href = link.getAttribute("href");
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        link.target === "_blank" ||
        link.hasAttribute("download") ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      let url;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }

      // External links are already going nowhere useful offline, but that's the browser's
      // problem to report, not this component's.
      if (
        url.origin !== window.location.origin ||
        url.pathname === window.location.pathname
      ) {
        return;
      }

      // Hold the navigation until we know whether the service worker has this page — the
      // check below is async, and by the time it resolves the default click has long passed.
      event.preventDefault();

      caches.match(url.href).then((cached) => {
        if (cached) {
          window.location.href = url.href;
          return;
        }
        clearTimeout(dismissTimer.current);
        setMessage(
          "You're offline, and this page hasn't been saved for offline reading. Reconnect and try again.",
        );
        dismissTimer.current = setTimeout(dismiss, 6000);
      });
    };

    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("click", handleClick, true);
      clearTimeout(dismissTimer.current);
    };
  }, []);

  if (!message) return null;

  return (
    <div className={styles.banner} role="status">
      <span className={styles.icon} aria-hidden="true">
        📡
      </span>
      <p className={styles.text}>{message}</p>
      <button
        type="button"
        className={styles.close}
        onClick={() => setMessage(null)}
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}
