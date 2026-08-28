/**
 * 📊 MatomoRouteTracker
 *
 * Docusaurus is a single page application: following an internal link swaps the
 * React tree through the History API instead of reloading the document. The
 * Matomo snippet injected from `docusaurus.config.js` only calls `trackPageView`
 * once, while the document is being parsed, so every client-side navigation was
 * invisible to Matomo. Visits looked like they never went past their landing
 * page, which pinned the reported bounce rate near 100% no matter what readers
 * actually did.
 *
 * This component reports each subsequent route change. It renders nothing.
 *
 * Two cases are deliberately ignored:
 * - the first route, already reported by the inline snippet;
 * - hash-only changes, so clicking a table of contents anchor does not count as
 *   reading a second page.
 */

import { useEffect, useRef } from "react";
import { useLocation } from "@docusaurus/router";

// Matomo's tracker queue: an untyped array of command tuples, pushed by the
// snippet injected from docusaurus.config.js before this component ever runs.
declare global {
  interface Window {
    _paq?: unknown[][];
  }
}

export default function MatomoRouteTracker(): null {
  const location = useLocation();
  const lastTrackedPath = useRef<string | null>(null);
  const lastTrackedUrl = useRef<string | null>(null);

  useEffect(() => {
    const path = `${location.pathname}${location.search}`;

    // First pass: only remember where the reader came from.
    if (lastTrackedPath.current === null) {
      lastTrackedPath.current = path;
      lastTrackedUrl.current = window.location.href;
      return undefined;
    }

    // Same page, different anchor: not a new page view.
    if (lastTrackedPath.current === path) {
      return undefined;
    }

    const referrerUrl = lastTrackedUrl.current;
    const currentUrl = window.location.href;
    lastTrackedPath.current = path;
    lastTrackedUrl.current = currentUrl;

    // Docusaurus rewrites <title> from a nested effect that is itself batched on
    // an animation frame. Waiting one frame reports the page view with the title
    // the reader actually sees rather than the previous one.
    const frame = window.requestAnimationFrame(() => {
      const paq = window._paq;

      if (!paq) {
        return;
      }

      paq.push(["setReferrerUrl", referrerUrl]);
      paq.push(["setCustomUrl", currentUrl]);
      paq.push(["setDocumentTitle", document.title]);
      paq.push(["trackPageView"]);
      // Rebind the freshly rendered DOM so outbound links and downloads keep
      // being tracked on the new page.
      paq.push(["enableLinkTracking"]);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [location]);

  return null;
}
