import React, { useEffect } from "react";
import { useLocation } from "@docusaurus/router";

/**
 * This Root component allows injecting code globally into the application.
 *
 * We use it here to implement a dynamic Table of Contents (TOC) label for mobile devices.
 * As the user scrolls, the TOC button text updates to reflect the current section heading,
 * providing better context than the static "On this page" label.
 */
export default function Root({ children }) {
  const location = useLocation();

  useEffect(() => {
    // Variable to store the initial text of the button (e.g., "On this page")
    let defaultText = null;

    const updateTocOnScroll = () => {
      // 1. Target the mobile TOC button
      // We look in .blog-toc-mobile (your custom class) or the standard class
      const tocButton =
        document.querySelector(".blog-toc-mobile button") ||
        document.querySelector('button[class*="tocCollapsibleButton"]');

      if (!tocButton) return;

      // Capture the default text if we haven't yet
      if (!defaultText) {
        defaultText = tocButton.innerText;
      }

      // 2. Select all headings in the main content
      // Using 'main' is more robust than specific class names like '.markdown'
      const headings = Array.from(
        document.querySelectorAll(
          "main h1, main h2, main h3, main h4, main h5, main h6"
        )
      );

      // 3. Find the active heading (the one that has passed above the reading area)
      // We use an offset (e.g., 100px) to detect the heading under the nav/toc bar
      const offset = 100;
      const currentHeading = headings
        .reverse()
        .find((h) => h.getBoundingClientRect().top < offset);

      if (currentHeading) {
        // 4. Update the button text
        if (tocButton.innerText !== currentHeading.innerText) {
          tocButton.innerText = currentHeading.innerText;
        }
      } else {
        // Restore default text if no heading is active
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

  return <>{children}</>;
}
