import { useState, useCallback, useEffect, useRef, type JSX } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Link from "@docusaurus/Link";
import styles from "./styles.module.css";

interface Props {
  /** Site-relative path of the feed, e.g. `/blog/tags/docker/rss.xml`. */
  feedUrl: string;
  /** What the reader would be following: `Docker`, `every new post`, … */
  label: string;
  /**
   * `card` — the full block, for tag/series pages and `/follow`.
   * `inline` — a compact trigger for the article action bar, opening the same
   * content in a popover.
   */
  variant?: "card" | "inline";
}

type Status = "idle" | "copied" | "error";

/**
 * "Follow this topic" — hands the reader the URL of an RSS feed and the two or
 * three ways to act on it.
 *
 * The feeds themselves are written at build time by
 * `plugins/blog-feed-plugin/index.js`: one site-wide (`/blog/rss.xml`), one per
 * tag (`/blog/tags/<slug>/rss.xml`) and one per series
 * (`/series/<slug>/rss.xml`). They existed long before this component and were
 * reachable by nobody — no page linked them, and only atom+json were advertised
 * through `<link rel="alternate">`. This is the human-facing half of that
 * plumbing.
 *
 * The visible URL plus its copy button is the primary path on purpose: it is the
 * only one that works in every reader. The Feedly and Inoreader links are
 * conveniences for the two dominant hosted readers, and `feed://` is last
 * because it fails *silently* when no desktop reader has registered the scheme.
 */
export default function FollowFeed({
  feedUrl,
  label,
  variant = "card",
}: Props): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  const [status, setStatus] = useState<Status>("idle");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Hosted readers need an absolute URL: they fetch the feed server-side, so a
  // site-relative path would resolve against feedly.com.
  const absoluteUrl = `${siteConfig.url.replace(/\/$/, "")}${feedUrl}`;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(absoluteUrl);
      setStatus("copied");
    } catch (err) {
      console.error("FollowFeed: failed to copy", err);
      setStatus("error");
    }
  }, [absoluteUrl]);

  useEffect(() => {
    if (status === "idle") return;
    const timer = setTimeout(() => setStatus("idle"), 2000);
    return () => clearTimeout(timer);
  }, [status]);

  // Escape and outside clicks close the popover — a reader who opened it by
  // mistake must not have to hunt for the toggle.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onPointerDown = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [open]);

  const body = (
    <>
      <p className={styles.intro}>
        New posts about <strong>{label}</strong>, delivered to your feed reader — no
        account, no email address, nothing to unsubscribe from. Paste this URL into your
        reader:
      </p>

      <div className={styles.urlRow}>
        <code className={styles.url}>{absoluteUrl}</code>
        <button type="button" className={styles.copyBtn} onClick={handleCopy}>
          {status === "copied"
            ? "✓ Copied"
            : status === "error"
              ? "Could not copy"
              : "Copy"}
        </button>
      </div>

      <div className={styles.readers}>
        <a
          className={styles.readerLink}
          href={`https://feedly.com/i/subscription/feed/${encodeURIComponent(absoluteUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Add to Feedly
        </a>
        <a
          className={styles.readerLink}
          href={`https://www.inoreader.com/?add_feed=${encodeURIComponent(absoluteUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Add to Inoreader
        </a>
        <a className={styles.readerLink} href={absoluteUrl.replace(/^https?:/, "feed:")}>
          Open in my reader
        </a>
      </div>

      <p className={styles.help}>
        No feed reader yet? <Link to="/follow">Start here</Link> — it takes two minutes.
      </p>
    </>
  );

  if (variant === "inline") {
    return (
      <div className={styles.inlineWrapper} ref={wrapperRef}>
        <button
          type="button"
          className={styles.trigger}
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-haspopup="dialog"
        >
          🔔 Follow {label}
        </button>
        {open && (
          <div className={styles.popover} role="dialog" aria-label={`Follow ${label}`}>
            {body}
          </div>
        )}
      </div>
    );
  }

  return (
    <section className={styles.card} aria-label={`Follow ${label}`}>
      <h3 className={styles.title}>Follow {label}</h3>
      {body}
    </section>
  );
}
