/**
 * Displays all articles belonging to a specific series.
 * Retrieves the series name from the query string (?name=SeriesName).
 * Renders a card for each article in the series, sorted from oldest to newest.
 * Each card links to its corresponding article.
 */
import { getBlogMetadata } from "@site/src/components/Blog/utils/posts";
import { createSlug } from "@site/src/components/Blog/utils/slug";
import { useLocation } from "@docusaurus/router";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import PostCard from "@site/src/components/Blog/PostCard";

function useQuery() {
  // Reads query string parameters from the current URL
  return new URLSearchParams(useLocation().search);
}

export default function SeriesArticlesPage() {
  // Retrieves the series slug from the query string
  const query = useQuery();
  const seriesSlug = query.get("name") || "";

  // Fetches all blog posts and filters those belonging to the selected series
  const posts = getBlogMetadata();

  // And filter to just a specific series. For instance, if the page is called with
  // "?name=creating-docusaurus-components", this array will just contains as many blog post
  // we've in that serie
  const seriesPosts = posts.filter((post) => {
    if (!post.series) return false;
    return createSlug(post.series) === seriesSlug;
  });

  // Gets the original series name for display purposes
  const originalSeriesName =
    seriesPosts.length > 0 ? seriesPosts[0].series : seriesSlug;

  // Sorts articles chronologically from oldest to newest
  const sortedPosts = seriesPosts.sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  return (
    <Layout title={`Series articles: ${originalSeriesName}`}>
      <div className="container margin-top--lg margin-bottom--lg">
        <h1>Series articles: {originalSeriesName}</h1>
        {/* <nav>
          <Link href="/series">← Back to all series</Link>
        </nav> */}
        {sortedPosts.length > 0 ? (
          <div className="row">
            {sortedPosts.map((post) => (
                <PostCard post={post} />
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
