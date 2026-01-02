import { createSlug } from "@site/src/components/Blog/utils/slug";
import { getBlogMetadata } from "@site/src/components/Blog/utils/posts";
import { useLocation, matchPath } from "@docusaurus/router";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import Translate, { translate } from "@docusaurus/Translate";
import PostCard from "@site/src/components/Blog/PostCard";
import styles from "./styles.module.css";

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

  const sortedPosts = seriesPosts.sort(
    (a, b) => new Date(a.date) - new Date(b.date)
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
        <h1>
          <Translate id="blog.seriesPage.title" values={{ name: originalSeriesName }}>
            {"Series articles: {name}"}
          </Translate>
        </h1>
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
                Oops, it looks like that series doesn't exist. Please check the name in the URL to make sure it's correct.
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
