import { createSlug } from "@site/src/components/Blog/utils/slug";
import { getBlogMetadata } from "@site/src/components/Blog/utils/posts";
import { useLocation, matchPath } from "@docusaurus/router";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import Translate, { translate } from "@docusaurus/Translate";
import styles from "./styles.module.css";
import PostCard from "@site/src/components/Blog/PostCard";

export default function TagArticlesPage() {
  const location = useLocation();
  const match = matchPath(location.pathname, {
    path: "/blog/tags/:slug",
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

  const posts = getBlogMetadata();
  const getTagLabel = (t) => (typeof t === "string" ? t : t.label);

  // Find original tag name based on slug
  let displayTag = rawTag;
  for (const post of posts) {
    const foundTag = (post.tags || []).find(
      (t) => createSlug(getTagLabel(t)) === rawTag
    );
    if (foundTag) {
      displayTag = getTagLabel(foundTag);
      break;
    }
  }

  // Filter and sort posts by slug-matched tag (most recent first)
  const taggedPosts = posts
    .filter((post) =>
      post.tags?.some((t) => createSlug(getTagLabel(t)) === rawTag)
    )
    .sort((a, b) => new Date(b.date) - new Date(a.date)); // Descending

  if (taggedPosts.length === 0) {
    return (
      <Layout
        title={translate(
          { id: "blog.tagPage.metaTitle", message: "Tag: {label}" },
          { label: displayTag }
        )}
      >
        <div className="container margin-top--lg margin-bottom--lg text--center">
          <h2>
            <Translate
              id="blog.tagPage.notFound"
              values={{ label: displayTag }}
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

  return (
    <Layout
      title={translate(
        { id: "blog.tagPage.metaTitle", message: "Tag: {label}" },
        { label: displayTag }
      )}
    >
      <div className="container margin-top--lg margin-bottom--lg">
        <h1>
          <Translate id="blog.tagPage.title" values={{ label: displayTag }}>
            {"Articles tagged: {label}"}
          </Translate>
        </h1>
        <div className={styles.postRow}>
          {taggedPosts.map((post) => (
            <PostCard key={post.permalink} post={post} />
          ))}
        </div>
      </div>
    </Layout>
  );
}
