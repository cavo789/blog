import { createSlug } from "@site/src/components/Blog/utils/slug";
import { getBlogMetadata } from "@site/src/components/Blog/utils/posts";
import { useLocation } from "@docusaurus/router";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import PostCard from "@site/src/components/Blog/PostCard";

function getTagFromPathname(pathname) {
  const match = pathname.match(/\/blog\/tags\/([^/]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export default function TagArticlesPage() {
  const location = useLocation();
  const rawTag = getTagFromPathname(location.pathname);

  if (!rawTag) {
    return (
      <Layout>
        <div className="container">
          <p>No tag specified.</p>
          <Link href="/blog/tags">Go back to all tags</Link>
        </div>
      </Layout>
    );
  }

  const posts = getBlogMetadata();

  // Find original tag name based on slug
  const allTags = Array.from(new Set(posts.flatMap((post) => post.tags || [])));
  const displayTag = allTags.find((t) => createSlug(t) === rawTag) || rawTag;

  // Filter and sort posts by slug-matched tag (most recent first)
  const taggedPosts = posts
    .filter((post) => post.tags?.some((t) => createSlug(t) === rawTag))
    .sort((a, b) => new Date(b.date) - new Date(a.date)); // Descending

  if (taggedPosts.length === 0) {
    return (
      <Layout title={`Tag: ${displayTag}`}>
        <div className="container margin-top--lg margin-bottom--lg text--center">
          <h2>No articles found with tag "{displayTag}"</h2>
          <Link href="/blog/tags">Browse all tags</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`Tag: ${displayTag}`}>
      <div className="container margin-top--lg margin-bottom--lg">
        <h1>Articles tagged: {displayTag}</h1>
        <div className="row">
          {taggedPosts.map((post) => (
            <PostCard key={post.title} post={post} />
          ))}
        </div>
      </div>
    </Layout>
  );
}
