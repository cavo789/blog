import { useState, useCallback, useEffect, useRef, type JSX } from "react";
import clsx from "clsx";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Link from "@docusaurus/Link";
import styles from "./styles.module.css";

interface Props {
  /** Site-relative path of the feed, e.g. `/blog/tags/docker/rss.xml`. */
  feedUrl: string;
  /** What the reader would be following: `Docker`, `every new post`, … */
  label: string;
  /**
   * `card` — the full block, for tag/series pages and `/follow`, where it sits
   * inside a page container and aligns with the content grid.
   * `section` — the homepage idiom: a centered <h2> over a three-column grid of
   * illustrated cards, one per reader profile, matching the HomeCards /
   * LatestPosts / MainTags grids around it. A `card` there reads as an article
   * callout dropped into a landing page, and a single full-width card reads as a
   * gap in the grid rhythm.
   * `inline` — a compact trigger for the article action bar, opening the same
   * content in a popover.
   */
  variant?: "card" | "section" | "inline";
}

type Status = "idle" | "copied" | "error";

/** Keep in sync with .popover's `width` in styles.module.css: min(28rem, 100vw - 2rem). */
const POPOVER_MAX_WIDTH_PX = 448;
const POPOVER_VIEWPORT_MARGIN_PX = 32;

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
  const [alignRight, setAlignRight] = useState(false);
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

  /*
   * Which edge the popover hangs from is decided per opening, not by a media
   * query: the trigger sits at the left of the content column in an article
   * header but is pushed hard right on /blog, and either fixed anchor overflows
   * the viewport in one of those two places. Measured here rather than in an
   * effect so the panel is never painted at the wrong edge first.
   */
  const toggleOpen = useCallback(() => {
    if (!open && wrapperRef.current) {
      const { left } = wrapperRef.current.getBoundingClientRect();
      // The panel's *effective* width, not its maximum: on a narrow screen the
      // CSS clamps it to the viewport, and measuring against 448px there made
      // every opening flip to the right edge — which pushed the panel off the
      // left of the screen instead, since the trigger is nowhere near the right.
      const width = Math.min(
        POPOVER_MAX_WIDTH_PX,
        window.innerWidth - POPOVER_VIEWPORT_MARGIN_PX,
      );
      setAlignRight(left + width > window.innerWidth - 16);
    }
    setOpen((value) => !value);
  }, [open]);

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
      {/*
        The label is carried by the heading above, never interpolated into this
        sentence: it has to read correctly for a tag ("Docker"), a series ("the
        “X” series") and the whole blog ("every new post") alike, and no single
        template survives all three ("New posts about every new post…").
      */}
      <p className={styles.intro}>
        They land in your feed reader on their own — no account, no email address, nothing
        to unsubscribe from. Paste this URL into your reader:
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
          onClick={toggleOpen}
          aria-expanded={open}
          aria-haspopup="dialog"
        >
          Follow {label}
        </button>
        {open && (
          <div
            className={clsx(styles.popover, alignRight && styles.popoverRight)}
            role="dialog"
            aria-label={`Follow ${label}`}
          >
            {/*
              The popover has no <h3> of its own to inherit from, so it repeats
              the topic here — otherwise "They land in your feed reader" opens on
              a pronoun with no antecedent. A <p>, not a heading: this sits in
              the article header and has no business in the document outline.
            */}
            <p className={styles.popoverTitle}>
              Follow <strong>{label}</strong>
            </p>
            {body}
          </div>
        )}
      </div>
    );
  }

  if (variant === "section") {
    /*
     * Not `body` in a single stretched card: the homepage speaks in three-column
     * grids of illustrated cards, and one 1100px-wide card holding 544px of
     * centered small print read as a hole punched in that rhythm — the whole
     * reason this variant was rebuilt.
     *
     * The three cards are not one per service, which would have made two of them
     * near-duplicates. They are one per reader profile: "I already have a
     * reader", "I am on a hosted one", "I have never used RSS" — so the block
     * also absorbs the /follow pointer that used to trail underneath in grey
     * 0.78rem type.
     */
    return (
      <section className={styles.section}>
        <h2>Follow {label}</h2>
        <p className={styles.sectionIntro}>
          No account, no email address, nothing to unsubscribe from — new posts land in
          your feed reader on their own.
        </p>

        <div className={styles.sectionGrid}>
          <div className={styles.sectionCard}>
            <span className={styles.cardIcon} aria-hidden="true">
              📋
            </span>
            <h3 className={styles.cardTitle}>Any feed reader</h3>
            <p className={styles.cardDescription}>
              Paste this URL into the reader you already use.
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
            {/*
              Last, and deliberately the quietest of the three cards' actions:
              `feed://` fails *silently* when no desktop reader has registered
              the scheme, so it must never look like the primary path.
            */}
            <a
              className={styles.cardAside}
              href={absoluteUrl.replace(/^https?:/, "feed:")}
            >
              …or open it in a desktop reader
            </a>
          </div>

          <div className={styles.sectionCard}>
            <span className={styles.cardIcon} aria-hidden="true">
              ⚡
            </span>
            <h3 className={styles.cardTitle}>Feedly or Inoreader</h3>
            <p className={styles.cardDescription}>
              On a hosted reader? One click and you are subscribed.
            </p>
            <div className={styles.readers}>
              <a
                className={styles.readerBtn}
                href={`https://feedly.com/i/subscription/feed/${encodeURIComponent(absoluteUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Add to Feedly
              </a>
              <a
                className={styles.readerBtn}
                href={`https://www.inoreader.com/?add_feed=${encodeURIComponent(absoluteUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Add to Inoreader
              </a>
            </div>
          </div>

          <Link to="/follow" className={styles.cardLink}>
            <div className={styles.sectionCard}>
              <span className={styles.cardIcon} aria-hidden="true">
                🧭
              </span>
              <h3 className={styles.cardTitle}>New to RSS?</h3>
              <p className={styles.cardDescription}>
                Pick a reader, subscribe to this blog, and never check the site again. It
                takes two minutes.
              </p>
              <span className={styles.cardCta}>Start here →</span>
            </div>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.card} aria-label={`Follow ${label}`}>
      <h3 className={styles.title}>Follow {label}</h3>
      {body}
    </section>
  );
}
