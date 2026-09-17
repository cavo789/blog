import type { JSX, ReactNode } from "react";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import FollowFeed from "@site/src/components/FollowFeed";
import { useBlogMetadata } from "@site/src/components/Blog/utils/posts";
import { createSlug } from "@site/src/components/Blog/utils/slug";
import { useTagLabel } from "@site/src/components/Blog/utils/tagsI18n";
import { useSeriesLocalizer } from "@site/src/components/Blog/utils/seriesI18n";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { useBaseUrlUtils } from "@docusaurus/useBaseUrl";
import { useSourceLocaleUrls } from "@site/src/components/Blog/utils/localeUrls";
import styles from "./follow.module.css";
import Translate, { translate } from "@docusaurus/Translate";

/**
 * "Follow this blog" — the one page that explains what a feed is and lists every
 * feed the build produces: the site-wide one in three formats, one per series
 * and one per tag (written by plugins/blog-feed-plugin).
 *
 * It exists so the pedagogy lives in a single place: the FollowFeed blocks
 * scattered on articles, tag pages and series pages link here instead of each
 * repeating "here is what an RSS reader is".
 *
 * The lists are derived from the same front matter the feed plugin groups on,
 * so a new tag or series shows up here without anyone editing this file.
 */
/** The three site-wide formats, in the order a reader should consider them. */
const WHOLE_BLOG_FORMATS: { path: string; label: ReactNode }[] = [
  {
    path: "/blog/rss.xml",
    label: (
      <Translate id="follow.format.rss">
        RSS 2.0, with the full text of each post
      </Translate>
    ),
  },
  { path: "/blog/atom.xml", label: "Atom" },
  { path: "/blog/feed.json", label: "JSON Feed" },
];

/**
 * Plain <a>, not Docusaurus's <Link>: these are static files written into the build output,
 * not registered routes, so <Link> would hand them to the client-side router and find nothing.
 * Same reasoning as the "View raw" link in CopyAsMarkdown and the Markdown link on a series page.
 *
 * `resolve` is what makes the list reusable per language — the same three paths, rendered once
 * for the current locale and once for the source one.
 */
function FormatList({ resolve }: { resolve: (path: string) => string }): JSX.Element {
  return (
    <ul className={styles.formatList}>
      {WHOLE_BLOG_FORMATS.map(({ path, label }) => (
        <li key={path}>
          <a href={resolve(path)} target="_blank" rel="noopener noreferrer">
            <code>{resolve(path)}</code>
          </a>{" "}
          — {label}
        </li>
      ))}
    </ul>
  );
}

export default function FollowPage(): JSX.Element {
  // Locale-aware on purpose: this page lists a feed per series and per tag with its article
  // count. Counting the English corpus under `fr` advertised "97 articles" for feeds that carry
  // four — and listed series and tags that have no French article at all.
  const posts = useBlogMetadata();
  const tagLabel = useTagLabel();
  const localizeSeries = useSeriesLocalizer();
  const { i18n } = useDocusaurusContext();
  // Every feed below is a static file written into the locale's own build output
  // (`build/fr/blog/rss.xml`), and every path here is hand-written — so none of them carries
  // the locale prefix on its own. Displayed as well as linked: showing `/blog/rss.xml` under
  // `fr` would hand the reader a URL for the wrong language to paste into their reader.
  const { withBaseUrl } = useBaseUrlUtils();
  const { isDefaultLocale, sourceLabel, sourceUrl } = useSourceLocaleUrls();

  const seriesEntries = new Map<string, { label: string; count: number }>();
  const tagEntries = new Map<string, { label: string; count: number }>();

  for (const post of posts) {
    if (post.series) {
      const slug = createSlug(post.series);
      const entry = seriesEntries.get(slug);
      if (entry) entry.count += 1;
      // `post.series` is the functional key — it drives `createSlug()` above and the feed URL.
      // Only the displayed label is swapped, falling back to the key on the default locale.
      else
        seriesEntries.set(slug, {
          label: localizeSeries(post.series)?.label ?? post.series,
          count: 1,
        });
    }

    // mainTag is folded in alongside tags, exactly as the feed plugin does it —
    // a post's main tag is not always repeated in its `tags` list.
    const seen = new Set<string>();
    for (const tag of [...post.tags, post.mainTag]) {
      if (!tag) continue;
      const value = typeof tag === "string" ? tag : tag.label;
      const slug = createSlug(value);
      if (!slug || seen.has(slug)) continue;
      seen.add(slug);

      const entry = tagEntries.get(slug);
      if (entry) entry.count += 1;
      else tagEntries.set(slug, { label: tagLabel(value), count: 1 });
    }
  }

  // The locale is passed explicitly: both lists are now sorted on localized, accented labels,
  // and `localeCompare` without it uses the runtime default — which differs between the Node
  // render and the browser, reordering the list at hydration.
  const byLabel = (a: [string, { label: string }], b: [string, { label: string }]) =>
    a[1].label.localeCompare(b[1].label, i18n.currentLocale);

  const seriesList = [...seriesEntries.entries()].sort(byLabel);
  const tagList = [...tagEntries.entries()].sort(byLabel);

  return (
    <Layout
      title={translate({ id: "follow.meta.title", message: "Follow this blog" })}
      description={translate({
        id: "follow.meta.description",
        message:
          "Every RSS feed published by this blog: the whole blog, one per series, one per tag.",
      })}
    >
      <div className="container margin-top--lg margin-bottom--xl">
        <h1>
          <Translate id="follow.title">Follow this blog</Translate>
        </h1>

        <p className={styles.lede}>
          <Translate id="follow.lede" values={{ feeds: <strong>feeds</strong> }}>
            {
              "No newsletter, no account, no tracking: this blog publishes {feeds}. You paste a URL into a feed reader once, and new posts show up there on their own — a little like a mailbox you own, except nobody gets your address."
            }
          </Translate>
        </p>

        <FollowFeed
          feedUrl="/blog/rss.xml"
          label={translate({
            id: "blog.followFeed.label.everyNewPost",
            message: "every new post",
          })}
        />

        <h2>
          <Translate id="follow.reader.heading">Never used a feed reader?</Translate>
        </h2>
        <p>
          <Translate
            id="follow.reader.lede"
            values={{
              feedly: (
                <a href="https://feedly.com" target="_blank" rel="noopener noreferrer">
                  Feedly
                </a>
              ),
              inoreader: (
                <a
                  href="https://www.inoreader.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Inoreader
                </a>
              ),
              netnewswire: (
                <a
                  href="https://netnewswire.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  NetNewsWire
                </a>
              ),
            }}
          >
            {
              "Pick one, paste a URL from this page into it, done. The popular hosted ones are {feedly} and {inoreader} (both free to start, both work in a browser). On the desktop, {netnewswire} and Thunderbird read feeds too. Any of them will do — the URLs below are standard."
            }
          </Translate>
        </p>

        <h2>
          <Translate id="follow.whole.heading">The whole blog</Translate>
        </h2>
        <p>
          <Translate id="follow.whole.lede">
            Three formats of the same thing. Take RSS unless your reader asks for
            something else; the Atom and JSON ones are generated by Docusaurus and carry
            summaries only.
          </Translate>
        </p>
        <FormatList resolve={withBaseUrl} />
        {/* Same offer as <FollowFeed>'s: the current language first, the source language as a
            secondary line. Only the whole-blog trio — repeating it under every series and tag
            row below would double the length of two already long lists. */}
        {!isDefaultLocale && (
          <div className={styles.otherLocale}>
            <p className={styles.otherLocaleIntro}>
              <Translate id="follow.whole.otherLocale" values={{ language: sourceLabel }}>
                {"The same three formats in {language}, following the whole blog:"}
              </Translate>
            </p>
            <FormatList resolve={sourceUrl} />
          </div>
        )}
        <p className={styles.formatNote}>
          <Translate id="follow.formatNote">
            Opening the RSS one in a browser shows a readable page rather than raw markup
            — it carries an XSLT stylesheet. Atom and JSON have none, so those two will
            look like what they are.
          </Translate>
        </p>

        <h2>
          <Translate id="follow.series.heading">One series at a time</Translate>
        </h2>
        <p>
          <Translate id="follow.series.lede">
            The most useful ones, honestly: a series feed tells you when the next episode
            of something you are already reading lands, and nothing else.
          </Translate>
        </p>
        <ul className={styles.feedList}>
          {seriesList.map(([slug, { label, count }]) => (
            <li key={slug}>
              <Link to={`/series/${slug}`}>{label}</Link>{" "}
              <span className={styles.count}>({count})</span>{" "}
              <a
                href={withBaseUrl(`/series/${slug}/rss.xml`)}
                className={styles.feedLink}
              >
                <Translate id="follow.feedLink">feed</Translate>
              </a>
            </li>
          ))}
        </ul>

        <h2>
          <Translate id="follow.topic.heading">One topic at a time</Translate>
        </h2>
        <p>
          <Translate id="follow.topic.lede" values={{ docker: <code>docker</code> }}>
            {
              "Every tag has its own feed. Follow {docker} and you will not hear about Outlook VBA."
            }
          </Translate>
        </p>
        <ul className={styles.feedList}>
          {tagList.map(([slug, { label, count }]) => (
            <li key={slug}>
              <Link to={`/blog/tags/${slug}`}>{label}</Link>{" "}
              <span className={styles.count}>({count})</span>{" "}
              <a
                href={withBaseUrl(`/blog/tags/${slug}/rss.xml`)}
                className={styles.feedLink}
              >
                <Translate id="follow.feedLink">feed</Translate>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  );
}
