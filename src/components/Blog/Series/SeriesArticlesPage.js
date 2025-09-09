import { createSlug } from "@site/src/components/Blog/utils/slug";
import { getBlogMetadata } from "@site/src/components/Blog/utils/posts";
import { useLocation, matchPath } from "@docusaurus/router";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import PostCard from "@site/src/components/Blog/PostCard";

export default function SeriesArticlesPage() {
  const location = useLocation();

  const match = matchPath(location.pathname, { path: "/series/:slug", exact: true });
  const slug = match?.params?.slug;

  if (!slug) {
    return (
      <Layout>
        <div className="container">
          <p>No series specified.</p>
          <Link href="/series">Go back to all series</Link>
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
    <Layout title={`Series articles: ${originalSeriesName}`}>
      <div className="container margin-top--lg margin-bottom--lg">
        <h1>Series articles: {originalSeriesName}</h1>
        {sortedPosts.length > 0 ? (
          <div className="row">
            {sortedPosts.map((post) => (
              <PostCard key={post.title} post={post} />
            ))}
          </div>
        ) : (
          <div className="text--center margin-vert--xl">
            <h2>No articles found for this series</h2>
            <p>
              Oops, it looks like that series doesn't exist. Please check the
              name in the URL to make sure it's correct.
            </p>
            <Link href="/series">
              Click here to browse all available series from our homepage.
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
}
