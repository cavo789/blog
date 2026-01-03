import React, { useEffect } from 'react';
import { useLocation } from '@docusaurus/router';

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
      const tocButton =
        document.querySelector('.blog-toc-mobile button') ||
        document.querySelector('button[class*="tocCollapsibleButton"]');

      if (!tocButton) return;

      // Capture the default text if we haven't yet
      if (!defaultText) {
        defaultText = tocButton.innerText;
      }

      // 2. Get all valid TOC link hrefs to ensure we only track article headings
      const tocLinks = Array.from(
        document.querySelectorAll('.table-of-contents a'),
      );
      const validTocIds = new Set(tocLinks.map((a) => a.getAttribute('href')));

      // If there's no TOC, restore default text and do nothing else.
      if (validTocIds.size === 0) {
        if (defaultText && tocButton.innerText !== defaultText) {
          tocButton.innerText = defaultText;
        }
        return;
      }

      // 3. Select all headings in the main content that could be in the TOC
      const headings = Array.from(
        document.querySelectorAll(
          'main h2, main h3, main h4, main h5, main h6',
        ),
      );

      // Filter headings to only include those that are actually in the TOC
      const tocHeadings = headings.filter(
        (h) => h.id && validTocIds.has(`#${h.id}`),
      );

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

    window.addEventListener('scroll', updateTocOnScroll);
    // Trigger once on mount to handle initial scroll position
    updateTocOnScroll();

    return () => window.removeEventListener('scroll', updateTocOnScroll);
  }, [location]);

  return <>{children}</>;
}
