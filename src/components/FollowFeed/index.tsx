import { useState, useCallback, useEffect, useRef, type JSX } from "react";
import clsx from "clsx";
import { useSourceLocaleUrls } from "@site/src/components/Blog/utils/localeUrls";
import Link from "@docusaurus/Link";
import styles from "./styles.module.css";
import Translate, { translate } from "@docusaurus/Translate";

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

/**
 * One feed URL and its copy button.
 *
 * Its own component, and its own `status`, because the block can now show two URLs: with a
 * single shared state, copying the English feed would flash "Copied" under the French one too.
 */
function FeedUrlRow({ url }: { url: string }): JSX.Element {
  const [status, setStatus] = useState<Status>("idle");

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setStatus("copied");
    } catch (err) {
      console.error("FollowFeed: failed to copy", err);
      setStatus("error");
    }
  }, [url]);

  useEffect(() => {
    if (status === "idle") return;
    const timer = setTimeout(() => setStatus("idle"), 2000);
    return () => clearTimeout(timer);
  }, [status]);

  return (
    <div className={styles.urlRow}>
      <code className={styles.url}>{url}</code>
      <button type="button" className={styles.copyBtn} onClick={handleCopy}>
        {status === "copied"
          ? translate({ id: "blog.followFeed.copied", message: "✓ Copied" })
          : status === "error"
            ? translate({ id: "blog.followFeed.copyError", message: "Could not copy" })
            : translate({ id: "blog.followFeed.copy", message: "Copy" })}
      </button>
    </div>
  );
}

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
  const [open, setOpen] = useState(false);
  const [alignRight, setAlignRight] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Hosted readers need an absolute URL: they fetch the feed server-side, so a
  // site-relative path would resolve against feedly.com.
  //
  // `feedUrl` is a site path this code assembled, so it carries no locale — see
  // `localeUrls.ts` for why both resolutions are needed and how the source one is derived.
  const {
    isDefaultLocale,
    sourceLabel: defaultLocaleLabel,
    sourceAbsoluteUrl,
    currentAbsoluteUrl,
  } = useSourceLocaleUrls();

  const absoluteUrl = currentAbsoluteUrl(feedUrl);
  const defaultLocaleUrl = sourceAbsoluteUrl(feedUrl);

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
        <Translate id="blog.followFeed.intro">
          They land in your feed reader on their own — no account, no email address,
          nothing to unsubscribe from. Paste this URL into your reader:
        </Translate>
      </p>

      <FeedUrlRow url={absoluteUrl} />

      <div className={styles.readers}>
        <a
          className={styles.readerLink}
          href={`https://feedly.com/i/subscription/feed/${encodeURIComponent(absoluteUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Translate id="blog.followFeed.addFeedly">Add to Feedly</Translate>
        </a>
        <a
          className={styles.readerLink}
          href={`https://www.inoreader.com/?add_feed=${encodeURIComponent(absoluteUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Translate id="blog.followFeed.addInoreader">Add to Inoreader</Translate>
        </a>
        <a className={styles.readerLink} href={absoluteUrl.replace(/^https?:/, "feed:")}>
          <Translate id="blog.followFeed.openInReader">Open in my reader</Translate>
        </a>
      </div>

      {/*
        Only on a non-default locale, and deliberately secondary rather than side by side: the
        feed of the page's own language stays the obvious choice, but a bilingual reader can
        take both instead of having one picked for them. Nothing here on the English pages —
        a four-article translated feed would be noise to a reader who already has all 257.
      */}
      {!isDefaultLocale && (
        <div className={styles.otherLocale}>
          <p className={styles.otherLocaleIntro}>
            <Translate
              id="blog.followFeed.otherLocale"
              values={{ language: defaultLocaleLabel }}
            >
              {"Read {language} too? The source-language feed follows the whole blog:"}
            </Translate>
          </p>
          <FeedUrlRow url={defaultLocaleUrl} />
        </div>
      )}

      <p className={styles.help}>
        <Translate
          id="blog.followFeed.noReader"
          values={{
            link: (
              <Link to="/follow">
                <Translate id="blog.followFeed.noReader.link">Start here</Translate>
              </Link>
            ),
          }}
        >
          {"No feed reader yet? {link} — it takes two minutes."}
        </Translate>
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
          <Translate id="blog.followFeed.follow" values={{ label }}>
            {"Follow {label}"}
          </Translate>
        </button>
        {open && (
          <div
            className={clsx(styles.popover, alignRight && styles.popoverRight)}
            role="dialog"
            aria-label={translate(
              { id: "blog.followFeed.follow.ariaLabel", message: "Follow {label}" },
              { label },
            )}
          >
            {/*
              The popover has no <h3> of its own to inherit from, so it repeats
              the topic here — otherwise "They land in your feed reader" opens on
              a pronoun with no antecedent. A <p>, not a heading: this sits in
              the article header and has no business in the document outline.
            */}
            <p className={styles.popoverTitle}>
              <Translate
                id="blog.followFeed.followStrong"
                values={{ label: <strong>{label}</strong> }}
              >
                {"Follow {label}"}
              </Translate>
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
        <h2>
          <Translate id="blog.followFeed.follow" values={{ label }}>
            {"Follow {label}"}
          </Translate>
        </h2>
        <p className={styles.sectionIntro}>
          <Translate id="blog.followFeed.section.lede">
            No account, no email address, nothing to unsubscribe from — new posts land in
            your feed reader on their own.
          </Translate>
        </p>

        <div className={styles.sectionGrid}>
          <div className={styles.sectionCard}>
            <span className={styles.cardIcon} aria-hidden="true">
              📋
            </span>
            <h3 className={styles.cardTitle}>
              <Translate id="blog.followFeed.anyReader">Any feed reader</Translate>
            </h3>
            <p className={styles.cardDescription}>
              <Translate id="blog.followFeed.section.paste">
                Paste this URL into the reader you already use.
              </Translate>
            </p>
            <FeedUrlRow url={absoluteUrl} />
            {/* Same offer as the `card` variant's — see the comment there. */}
            {!isDefaultLocale && (
              <div className={styles.otherLocale}>
                <p className={styles.otherLocaleIntro}>
                  <Translate
                    id="blog.followFeed.otherLocale"
                    values={{ language: defaultLocaleLabel }}
                  >
                    {
                      "Read {language} too? The source-language feed follows the whole blog:"
                    }
                  </Translate>
                </p>
                <FeedUrlRow url={defaultLocaleUrl} />
              </div>
            )}
            {/*
              Last, and deliberately the quietest of the three cards' actions:
              `feed://` fails *silently* when no desktop reader has registered
              the scheme, so it must never look like the primary path.
            */}
            <a
              className={styles.cardAside}
              href={absoluteUrl.replace(/^https?:/, "feed:")}
            >
              <Translate id="blog.followFeed.section.desktop">
                …or open it in a desktop reader
              </Translate>
            </a>
          </div>

          <div className={styles.sectionCard}>
            <span className={styles.cardIcon} aria-hidden="true">
              ⚡
            </span>
            <h3 className={styles.cardTitle}>
              <Translate id="blog.followFeed.hosted">Feedly or Inoreader</Translate>
            </h3>
            <p className={styles.cardDescription}>
              <Translate id="blog.followFeed.section.hosted">
                On a hosted reader? One click and you are subscribed.
              </Translate>
            </p>
            <div className={styles.readers}>
              <a
                className={styles.readerBtn}
                href={`https://feedly.com/i/subscription/feed/${encodeURIComponent(absoluteUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Translate id="blog.followFeed.addFeedly">Add to Feedly</Translate>
              </a>
              <a
                className={styles.readerBtn}
                href={`https://www.inoreader.com/?add_feed=${encodeURIComponent(absoluteUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Translate id="blog.followFeed.addInoreader">Add to Inoreader</Translate>
              </a>
            </div>
          </div>

          <Link to="/follow" className={styles.cardLink}>
            <div className={styles.sectionCard}>
              <span className={styles.cardIcon} aria-hidden="true">
                🧭
              </span>
              <h3 className={styles.cardTitle}>
                <Translate id="blog.followFeed.newToRss">New to RSS?</Translate>
              </h3>
              <p className={styles.cardDescription}>
                <Translate id="blog.followFeed.section.newToRss">
                  Pick a reader, subscribe to this blog, and never check the site again.
                  It takes two minutes.
                </Translate>
              </p>
              <span className={styles.cardCta}>
                <Translate id="blog.followFeed.startHere">Start here →</Translate>
              </span>
            </div>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section
      className={styles.card}
      aria-label={translate(
        { id: "blog.followFeed.follow.ariaLabel", message: "Follow {label}" },
        { label },
      )}
    >
      <h3 className={styles.title}>
        <Translate id="blog.followFeed.follow" values={{ label }}>
          {"Follow {label}"}
        </Translate>
      </h3>
      {body}
    </section>
  );
}
