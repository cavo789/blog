import { createSlug } from "@site/src/components/Blog/utils/slug";
import { getBlogMetadata } from "@site/src/components/Blog/utils/posts";
import { hexToRgba } from "@site/src/components/Blog/utils/color";
import { useLocation, matchPath } from "@docusaurus/router";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import Translate, { translate } from "@docusaurus/Translate";
import PostCard from "@site/src/components/Blog/PostCard";
import SERIES_DATA from "@site/src/data/series.js";
import styles from "./styles.module.css";

const DEFAULT_IMAGE = "/img/default.webp";

export default function SeriesArticlesPage() {
  const location = useLocation();

  const match = matchPath(location.pathname, {
    path: "/series/:slug",
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

  const posts = getBlogMetadata();
  const seriesPosts = posts.filter((post) => {
    if (!post.series) return false;
    return createSlug(post.series) === slug;
  });

  const originalSeriesName =
    seriesPosts.length > 0 ? seriesPosts[0].series : slug;

  const seriesData = SERIES_DATA.find((s) => s.name === originalSeriesName);

  const heroStyle = seriesData?.color
    ? {
        "--series-accent-solid": hexToRgba(seriesData.color, 1),
        "--series-accent-light": hexToRgba(seriesData.color, 0.16),
        "--series-accent-dark": hexToRgba(seriesData.color, 0.3),
        "--series-accent-glow-light": hexToRgba(seriesData.color, 0.35),
        "--series-accent-glow-dark": hexToRgba(seriesData.color, 0.55),
      }
    : undefined;

  const sortedPosts = seriesPosts.sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  return (
    <Layout
      title={translate(
        {
          id: "blog.seriesPage.metaTitle",
          message: "Series articles: {name}",
        },
        { name: originalSeriesName }
      )}
    >
      <div className="container margin-top--lg margin-bottom--lg">
        <div className={styles.seriesHero} style={heroStyle}>
          {sortedPosts.length > 0 && (
            <img
              src={seriesData?.image ?? DEFAULT_IMAGE}
              alt={originalSeriesName}
              loading="lazy"
              className={styles.seriesBanner}
            />
          )}
          <h1>
            <Translate id="blog.seriesPage.title" values={{ name: originalSeriesName }}>
              {"Series articles: {name}"}
            </Translate>
          </h1>
          <span className={styles.seriesTitleAccent} aria-hidden="true" />
          {seriesData?.description && (
            <p className={styles.seriesDescription}>{seriesData.description}</p>
          )}
          {sortedPosts.length > 0 && (
            // Plain <a>, not Docusaurus's <Link>: this file is a static asset
            // written by plugins/markdown-export-plugin's postBuild step, not
            // a registered route, so <Link> would have nothing to resolve
            // against. Same reasoning as CopyAsMarkdown's "View raw" link.
            <a
              href={`/llms/${slug}.txt`}
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
