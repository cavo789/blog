import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { useLocation } from "@docusaurus/router";
import useBaseUrl from "@docusaurus/useBaseUrl";
import KonamiEasterEgg from "@site/src/components/KonamiEasterEgg";
import ShakeEasterEgg from "@site/src/components/ShakeEasterEgg";
import MatomoRouteTracker from "@site/src/components/Analytics/MatomoRouteTracker";
import OfflineNotice from "@site/src/components/OfflineNotice";

/**
 * This Root component allows injecting code globally into the application.
 *
 * We use it here to implement a dynamic Table of Contents (TOC) label for mobile devices.
 * As the user scrolls, the TOC button text updates to reflect the current section heading,
 * providing better context than the static "On this page" label.
 */
export default function Root({ children }) {
  const location = useLocation();
  const sleepingFaviconUrl = useBaseUrl("/img/favicon-sleeping.png");

  // Console easter egg: a little wink for visitors who open DevTools.
  // Runs once per full page load, not on every client-side route change.
  useEffect(() => {
    console.log(
      "%c \u{1F9AB} Curious, aren't you?",
      "font-size:18px;font-weight:bold;color:#e8871e;",
    );
    console.log(
      "%cThe meerkat sentry is watching this site too. If you enjoy digging around in the source, try the Konami code somewhere on this page...",
      "font-size:12px;color:#888;",
    );
  }, []);

  // Title bar easter egg: greet visitors who leave the tab and come back,
  // swapping the favicon for a dozing meerkat while they're away.
  useEffect(() => {
    const originalTitle = document.title;
    const faviconLink = document.querySelector('link[rel="icon"]');
    const originalFavicon = faviconLink?.href;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        document.title = "Come back, the meerkat is on watch! \u{1F440}";
        if (faviconLink) faviconLink.href = sleepingFaviconUrl;
      } else {
        document.title = originalTitle;
        if (faviconLink && originalFavicon) faviconLink.href = originalFavicon;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [location, sleepingFaviconUrl]);

  useEffect(() => {
    // Variable to store the initial text of the button (e.g., "On this page")
    let defaultText = null;

    const updateTocOnScroll = () => {
      // 1. Target the mobile TOC button
      const tocButton =
        document.querySelector(".blog-toc-mobile button") ||
        document.querySelector('button[class*="tocCollapsibleButton"]');

      if (!tocButton) return;

      // Capture the default text if we haven't yet
      if (!defaultText) {
        defaultText = tocButton.innerText;
      }

      // 2. Get all valid TOC link hrefs to ensure we only track article headings
      const tocLinks = Array.from(document.querySelectorAll(".table-of-contents a"));
      const validTocIds = new Set(tocLinks.map((a) => a.getAttribute("href")));

      // If there's no TOC, restore default text and do nothing else.
      if (validTocIds.size === 0) {
        if (defaultText && tocButton.innerText !== defaultText) {
          tocButton.innerText = defaultText;
        }
        return;
      }

      // 3. Select all headings in the main content that could be in the TOC
      const headings = Array.from(
        document.querySelectorAll("main h2, main h3, main h4, main h5, main h6"),
      );

      // Filter headings to only include those that are actually in the TOC
      const tocHeadings = headings.filter((h) => h.id && validTocIds.has(`#${h.id}`));

      // 4. Find the active heading from the bottom up from our filtered list.
      const offset = 100;
      const currentTocHeading = tocHeadings
        .reverse()
        .find((h) => h.getBoundingClientRect().top < offset);

      // 5. If a valid TOC heading is active, update the button text
      if (currentTocHeading) {
        if (tocButton.innerText !== currentTocHeading.innerText) {
          tocButton.innerText = currentTocHeading.innerText;
        }
      } else {
        // Otherwise, restore default text (we are likely at the top of the page)
        if (defaultText && tocButton.innerText !== defaultText) {
          tocButton.innerText = defaultText;
        }
      }
    };

    window.addEventListener("scroll", updateTocOnScroll);
    // Trigger once on mount to handle initial scroll position
    updateTocOnScroll();

    return () => window.removeEventListener("scroll", updateTocOnScroll);
  }, [location]);

  return (
    <>
      {children}
      <MatomoRouteTracker />
      <KonamiEasterEgg />
      <ShakeEasterEgg />
      <OfflineNotice />
    </>
  );
}
Root.propTypes = {
  children: PropTypes.node,
};
