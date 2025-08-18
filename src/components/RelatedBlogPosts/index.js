import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { useBlogPost } from "@docusaurus/plugin-content-blog/client";
import { getBlogMetadata } from "@site/src/components/utils/blogPosts";

export default function RelatedPosts({ count = 3, description = false }) {
  const { metadata } = useBlogPost();
  const currentPermalink = metadata.permalink;
  const mainTag = metadata.frontMatter.mainTag;
  const tags = metadata.frontMatter.tags || [];

  if (!mainTag && tags.length === 0) return null; // nothing to filter on

  const posts = getBlogMetadata();
  let filtered = posts;

  // Prefer mainTag if available
  if (mainTag) {
    const filteredByMainTag = posts.filter((post) => {
      const postTags = post.tags.map((t) =>
        typeof t === "string" ? t : t.label
      );
      return postTags.includes(mainTag);
    });

    if (filteredByMainTag.length > 0) {
      filtered = filteredByMainTag;
    } else if (tags.length > 0) {
      filtered = posts.filter((post) => {
        const postTagLabels = post.tags.map((t) =>
          typeof t === "string" ? t : t.label
        );
        return postTagLabels.some((label) => tags.includes(label));
      });
    } else {
      filtered = [];
    }
  } else if (tags.length > 0) {
    filtered = filtered.filter((post) => {
      const postTagLabels = post.tags.map((t) =>
        typeof t === "string" ? t : t.label
      );
      return postTagLabels.some((label) => tags.includes(label));
    });
  }

  // Exclude current post
  filtered = filtered.filter((post) => post.permalink !== currentPermalink);

  // Randomize and take top N
  const ordered = [...filtered].sort(() => 0.5 - Math.random());
  const related = ordered.slice(0, count);

  if (!related.length) return <p>No related posts.</p>;

  return (
    <>
      <h3>Related posts</h3>
      <div className="row">
        {related.map((post) => (
          <div
            className="col col--4"
            key={post.permalink}
            style={{ marginBottom: "2rem", display: "flex" }}
          >
            <div
              className="card"
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              <Link to={post.permalink}>
                <div className="card__image">
                  {post.image && (
                    <img
                      src={useBaseUrl(post.image)}
                      alt={post.title}
                      style={{
                        width: "100%",
                        height: 180,
                        objectFit: "cover",
                        borderTopLeftRadius: 8,
                        borderTopRightRadius: 8,
                      }}
                    />
                  )}
                </div>
                <div className="card__body" style={{ flex: 1 }}>
                  <h3>{post.title}</h3>
                  {description && post.description && (
                    <div
                      style={{
                        color: "#6c63ff",
                        fontWeight: "bold",
                        marginBottom: 6,
                      }}
                    >
                      {post.description}
                    </div>
                  )}
                  <p
                    style={{
                      color: "#888",
                      fontSize: "0.95em",
                      marginBottom: 8,
                    }}
                  >
                    {post.date && (
                      <span>{new Date(post.date).toLocaleDateString()}</span>
                    )}
                  </p>
                </div>
              </Link>
              <div className="card__footer" style={{ textAlign: "right" }}>
                <Link
                  className="button button--primary button--sm"
                  to={post.permalink}
                >
                  Read more
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
