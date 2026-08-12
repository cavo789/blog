/**
 * AskMyBlogWidget — a third, always-visible entry point into "Ask my blog" (alongside
 * Ctrl+K → `?` and the standalone /faq page): a floating bubble, bottom-right, that opens a
 * small panel wrapping the existing <AskMyBlog> search box (src/components/AskMyBlog). It
 * doesn't reimplement search — <AskMyBlog> is only mounted once the panel is actually open,
 * so the question corpus fetch stays on-demand exactly as it already is for CommandPalette's
 * `?` mode (see AskMyBlog/questionsIndex.js for why that fetch is lazy).
 *
 * Reserves a fixed slot stacked above the scroll-to-top button's corner
 * (src/components/ScrollToTopButton) rather than detecting its presence at runtime —
 * scroll-to-top isn't mounted on every page, and the empty space above it when it's absent is
 * harmless.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { translate } from "@docusaurus/Translate";
import AskMyBlog from "@site/src/components/AskMyBlog";
import { setActiveOverlay } from "@site/src/components/CommandPalette/paletteBus";
import mascot from "@site/static/img/ask_my_blog.webp";
import styles from "./styles.module.css";

const HINT_STORAGE_KEY = "askmyblog_bubble_hint_shown";
const HINT_DELAY_MS = 15_000;

export default function AskMyBlogWidget() {
  const [open, setOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const panelRef = useRef(null);
  const bubbleRef = useRef(null);
  const clearOverlayRef = useRef(null);

  // First-visit discoverability, shown at most once ever — same mechanic as
  // CommandPalette/Hint.js, offset from its 10s delay so the two don't animate in together.
  useEffect(() => {
    if (localStorage.getItem(HINT_STORAGE_KEY)) return undefined;
    const timer = setTimeout(() => {
      localStorage.setItem(HINT_STORAGE_KEY, "1");
      setShowHint(true);
    }, HINT_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    clearOverlayRef.current?.();
    bubbleRef.current?.focus();
  }, []);

  const toggle = () => {
    setShowHint(false);
    if (open) {
      close();
      return;
    }
    setOpen(true);
    clearOverlayRef.current = setActiveOverlay(close);
  };

  useEffect(() => {
    if (!open) return undefined;

    panelRef.current?.querySelector("input")?.focus();

    function onKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
    }

    function onTab(event) {
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll(
        'button, [href], input, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keydown", onTab);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keydown", onTab);
    };
  }, [open, close]);

  return (
    <>
      {open && (
        <div
          ref={panelRef}
          className={styles.panel}
          role="dialog"
          aria-modal="true"
          aria-label="Ask my blog"
        >
          <div className={styles.panelHead}>
            <span className={styles.panelHeadTitle}>
              <img src={mascot} alt="" className={styles.panelHeadMascot} width="40" height="40" />
              Ask my blog
            </span>
            <button
              type="button"
              className={styles.panelClose}
              aria-label={translate({
                id: "theme.common.askMyBlogClose",
                message: "Close",
                description: "The aria label for closing the Ask my blog chat panel",
              })}
              onClick={close}
            >
              &times;
            </button>
          </div>
          <div className={styles.panelBody}>
            <AskMyBlog placeholder="Ask a question…" maxResults={5} showLabel={false} />
          </div>
        </div>
      )}
      <button
        ref={bubbleRef}
        type="button"
        className={styles.bubble}
        onClick={toggle}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={translate({
          id: "theme.common.askMyBlog",
          message: "Ask my blog",
          description: "The aria label for the floating Ask my blog chat bubble",
        })}
      >
        {showHint && <span className={styles.pulseRing} aria-hidden="true" />}
        <svg
          className={styles.bubbleIcon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      </button>
    </>
  );
}
