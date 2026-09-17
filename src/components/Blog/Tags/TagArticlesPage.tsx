import type { JSX } from "react";
import { createSlug } from "@site/src/components/Blog/utils/slug";
import { useBlogMetadata } from "@site/src/components/Blog/utils/posts";
import { useLocation, matchPath } from "@docusaurus/router";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { useBaseUrlUtils } from "@docusaurus/useBaseUrl";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import Translate, { translate } from "@docusaurus/Translate";
import styles from "./styles.module.css";
import PostCard from "@site/src/components/Blog/PostCard";
import Head from "@docusaurus/Head";
import FollowFeed from "@site/src/components/FollowFeed";
import { useTagLabel } from "@site/src/components/Blog/utils/tagsI18n";
import { useSourceLocaleUrls } from "@site/src/components/Blog/utils/localeUrls";

type Tag = string | { label: string };

export default function TagArticlesPage(): JSX.Element {
  const location = useLocation();
  // Hooks must run before any early return.
  const posts = useBlogMetadata();
  const tagLabel = useTagLabel();
  const { isDefaultLocale, sourceLabel, sourceLocale, sourceUrl } =
    useSourceLocaleUrls();
  const { withBaseUrl } = useBaseUrlUtils();

  // The pattern MUST carry `baseUrl`: under the `fr` locale the pathname is `/fr/blog/tags/<slug>`
  // and a hardcoded pattern silently matches nothing, rendering the "not found" branch on a
  // perfectly valid page (TODO 0119).
  const { siteConfig } = useDocusaurusContext();
  const base = siteConfig.baseUrl.replace(/\/$/, "");
  const match = matchPath<{ slug: string }>(location.pathname, {
    path: `${base}/blog/tags/:slug`,
    exact: true,
  });
  const rawTag = match?.params?.slug;

  if (!rawTag) {
    return (
      <Layout>
        <div className="container">
          <p>
            <Translate id="blog.tagPage.noTag">No tag specified.</Translate>
          </p>
          <Link to="/blog/tags">
            <Translate id="blog.tagPage.backToTags">
              Go back to all tags
            </Translate>
          </Link>
        </div>
      </Layout>
    );
  }

  // Local helper, unrelated to `useTagLabel`: it reads the raw value out of a front-matter
  // entry, which may be a bare string or a `{ label }` object. What comes out is the KEY.
  const getTagKey = (t: Tag) => (typeof t === "string" ? t : t.label);

  // Find original tag name based on slug
  let displayTag = rawTag;
  for (const post of posts) {
    const foundTag = (post.tags || []).find(
      (t) => createSlug(getTagKey(t)) === rawTag
    );
    if (foundTag) {
      displayTag = getTagKey(foundTag);
      break;
    }
  }

  // `displayTag` is the front-matter KEY; this is what the reader sees. Resolving it here, once,
  // also closes the inconsistency noted below: the <h1> used to print the raw key ("ai") while
  // the feed button right under it printed the real label ("Artificial Intelligence (AI)").
  const displayLabel = tagLabel(displayTag);

  // Filter and sort posts by slug-matched tag (most recent first)
  const taggedPosts = posts
    .filter((post) =>
      post.tags?.some((t) => createSlug(getTagKey(t)) === rawTag)
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Descending

  if (taggedPosts.length === 0) {
    return (
      <Layout
        title={translate(
          { id: "blog.tagPage.metaTitle", message: "Tag: {label}" },
          { label: displayLabel }
        )}
      >
        <div className="container margin-top--lg margin-bottom--lg text--center">
          <h2>
            <Translate
              id="blog.tagPage.notFound"
              values={{ label: displayLabel }}
            >
              {'No articles found with tag "{label}"'}
            </Translate>
          </h2>
          <Link to="/blog/tags">
            <Translate id="blog.tagPage.browseTags">Browse all tags</Translate>
          </Link>
        </div>
      </Layout>
    );
  }

  const feedUrl = `/blog/tags/${rawTag}/rss.xml`;

  return (
    <Layout
      title={translate(
        { id: "blog.tagPage.metaTitle", message: "Tag: {label}" },
        { label: displayLabel }
      )}
    >
      <div className="container margin-top--lg margin-bottom--lg">
        <h1>
          <Translate id="blog.tagPage.title" values={{ label: displayLabel }}>
            {"Articles tagged: {label}"}
          </Translate>
        </h1>
        {/*
          This route is registered by docusaurus-plugin-tag-route, not by the
          blog plugin, so Docusaurus injects no feed autodiscovery of its own
          here — same reasoning as src/components/MarkdownAlternate.
        */}
        <Head>
          {/* `feedUrl` is a hand-built path to a per-locale static file, so it needs the
              prefix; the second <link> points at the source language, which covers the whole
              blog. Helmet de-duplicates <link> on `href`, so both are kept. */}
          <link
            rel="alternate"
            type="application/rss+xml"
            href={withBaseUrl(feedUrl)}
            title={translate(
              { id: "feed.linkTitle", message: "{name} — RSS feed" },
              { name: displayLabel },
            )}
          />
          {!isDefaultLocale && (
            <link
              rel="alternate"
              type="application/rss+xml"
              href={sourceUrl(feedUrl)}
              hrefLang={sourceLocale}
              title={translate(
                {
                  id: "feed.linkTitleSourceBlog",
                  message: "{name} — RSS feed ({language} — the whole blog)",
                },
                { name: displayLabel, language: sourceLabel },
              )}
            />
          )}
        </Head>
        <FollowFeed feedUrl={feedUrl} label={displayLabel} />
        <div className={styles.postRow}>
          {taggedPosts.map((post) => (
            <PostCard key={post.permalink} post={post} />
          ))}
        </div>
      </div>
    </Layout>
  );
}
