import type { CSSProperties, JSX } from "react";
import { createSlug } from "@site/src/components/Blog/utils/slug";
import { useBlogMetadata } from "@site/src/components/Blog/utils/posts";
import { hexToRgba } from "@site/src/components/Blog/utils/color";
import { useSeriesLocalizer } from "@site/src/components/Blog/utils/seriesI18n";
import { useLocation, matchPath } from "@docusaurus/router";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { useBaseUrlUtils } from "@docusaurus/useBaseUrl";
import { useSourceLocaleUrls } from "@site/src/components/Blog/utils/localeUrls";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import Translate, { translate } from "@docusaurus/Translate";
import PostCard from "@site/src/components/Blog/PostCard";
import SERIES_DATA from "@site/src/data/series.js";
import Head from "@docusaurus/Head";
import FollowFeed from "@site/src/components/FollowFeed";
import styles from "./styles.module.css";

const DEFAULT_IMAGE = "/img/default.webp";

export default function SeriesArticlesPage(): JSX.Element {
  const location = useLocation();
  // Hooks must run before any early return.
  const posts = useBlogMetadata();
  const localizeSeries = useSeriesLocalizer();
  // The hook flavour would have to sit here, above the early return, but the banner path is only
  // known further down — so take the plain function and call it where the value exists.
  const { withBaseUrl } = useBaseUrlUtils();
  const { isDefaultLocale, sourceLabel, sourceLocale, sourceUrl } =
    useSourceLocaleUrls();


  // The pattern MUST carry `baseUrl`: under the `fr` locale the pathname is `/fr/series/<slug>`
  // and a hardcoded pattern silently matches nothing, rendering the "not found" branch on a
  // perfectly valid page (TODO 0119).
  const { siteConfig } = useDocusaurusContext();
  const base = siteConfig.baseUrl.replace(/\/$/, "");
  const match = matchPath<{ slug: string }>(location.pathname, {
    path: `${base}/series/:slug`,
    exact: true,
  });
  const slug = match?.params?.slug;

  if (!slug) {
    return (
      <Layout>
        <div className="container">
          <p>
            <Translate id="blog.seriesPage.noSeriesSpecified">No series specified.</Translate>
          </p>
          <Link to="/series">
            <Translate id="blog.seriesPage.backToSeries">Go back to all series</Translate>
          </Link>
        </div>
      </Layout>
    );
  }

  const seriesPosts = posts.filter((post) => {
    if (!post.series) return false;
    return createSlug(post.series) === slug;
  });

  // seriesPosts is filtered on a truthy `series`, so the first entry's `series`
  // is always a string here; `?? slug` covers the empty-list case (and satisfies
  // the `string | null` type without a cast).
  const originalSeriesName = seriesPosts[0]?.series ?? slug;

  const seriesData = SERIES_DATA.find((s) => s.name === originalSeriesName);
  const seriesBannerUrl = withBaseUrl(seriesData?.image ?? DEFAULT_IMAGE);

  // `originalSeriesName` is the functional key — it drives the slug, the front matter match and
  // the RSS feed, and must never be translated. Only these two are shown to the reader, and they
  // fall back to the English SERIES_DATA when the locale has no row for this series.
  const localized = localizeSeries(originalSeriesName);
  const displayName = localized?.label ?? originalSeriesName;
  const displayDescription = localized?.description ?? seriesData?.description;

  const heroStyle: CSSProperties | undefined = seriesData?.color
    ? ({
        "--series-accent-solid": hexToRgba(seriesData.color, 1),
        "--series-accent-light": hexToRgba(seriesData.color, 0.16),
        "--series-accent-dark": hexToRgba(seriesData.color, 0.3),
        "--series-accent-glow-light": hexToRgba(seriesData.color, 0.35),
        "--series-accent-glow-dark": hexToRgba(seriesData.color, 0.55),
      } as CSSProperties)
    : undefined;

  const sortedPosts = seriesPosts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <Layout
      title={translate(
        {
          id: "blog.seriesPage.metaTitle",
          message: "Series articles: {name}",
        },
        { name: displayName }
      )}
    >
      <div className="container margin-top--lg margin-bottom--lg">
        <div className={styles.seriesHero} style={heroStyle}>
          {sortedPosts.length > 0 && (
            <img
              // Same baseUrl rule as PostCard: a series banner path comes from
              // `src/data/series.js`, so it carries no locale prefix of its own.
              src={seriesBannerUrl}
              alt={displayName}
              loading="lazy"
              className={styles.seriesBanner}
            />
          )}
          <h1>
            <Translate id="blog.seriesPage.title" values={{ name: displayName }}>
              {"Series articles: {name}"}
            </Translate>
          </h1>
          <span className={styles.seriesTitleAccent} aria-hidden="true" />
          {displayDescription && (
            <p className={styles.seriesDescription}>{displayDescription}</p>
          )}
          {sortedPosts.length > 0 && (
            // Plain <a>, not Docusaurus's <Link>: this file is a static asset
            // written by plugins/markdown-export-plugin's postBuild step, not
            // a registered route, so <Link> would have nothing to resolve
            // against. Same reasoning as CopyAsMarkdown's "View raw" link.
            //
            // Because it is not a route, nothing prefixes it either: the plugin writes one
            // bundle per locale into that locale's outDir (`build/fr/llms/…`), so a bare
            // `/llms/…` sends a French reader to the English bundle.
            <a
              href={withBaseUrl(`/llms/${slug}.txt`)}
              className={styles.markdownLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Translate id="blog.seriesPage.markdownLink">
                📄 View this series as plain Markdown
              </Translate>
            </a>
          )}
        </div>
        {sortedPosts.length > 0 && (
          <>
            {/*
              /series/<slug> is a custom route (docusaurus-plugin-series-route),
              so nothing injects feed autodiscovery here on its own — see
              src/components/MarkdownAlternate for the same pattern.
            */}
            <Head>
              <link
                rel="alternate"
                type="application/rss+xml"
                href={withBaseUrl(`/series/${slug}/rss.xml`)}
                title={translate(
                  { id: "feed.linkTitle", message: "{name} — RSS feed" },
                  { name: originalSeriesName },
                )}
              />
              {/* The same series in the source language: more articles, since only part of the
                  series is translated. Helmet keys <link> on `href`, so this is kept too. */}
              {!isDefaultLocale && (
                <link
                  rel="alternate"
                  type="application/rss+xml"
                  href={sourceUrl(`/series/${slug}/rss.xml`)}
                  hrefLang={sourceLocale}
                  title={translate(
                    {
                      id: "feed.linkTitleSourceSeries",
                      message: "{name} — RSS feed ({language} — the whole series)",
                    },
                    { name: originalSeriesName, language: sourceLabel },
                  )}
                />
              )}
            </Head>
            <FollowFeed
              feedUrl={`/series/${slug}/rss.xml`}
              label={translate(
                {
                  id: "blog.followFeed.label.series",
                  message: 'the "{name}" series',
                },
                { name: displayName },
              )}
            />
          </>
        )}
        {sortedPosts.length > 0 ? (
          <div className={styles.seriesGrid}>
            {sortedPosts.map((post) => (
              <PostCard key={post.permalink} post={post} />
            ))}
          </div>
        ) : (
          <div className="text--center margin-vert--xl">
            <h2>
              <Translate id="blog.seriesPage.notFound.title">No articles found for this series</Translate>
            </h2>
            <p>
              <Translate id="blog.seriesPage.notFound.message">
                Oops, it looks like that series doesn&apos;t exist. Please check the name in the URL to make sure it&apos;s correct.
              </Translate>
            </p>
            <Link to="/series">
              <Translate id="blog.seriesPage.notFound.link">Click here to browse all available series from our homepage.</Translate>
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
}
