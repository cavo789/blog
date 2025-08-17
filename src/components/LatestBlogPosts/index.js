import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";

const blogPosts = require.context("../../../blog", true, /\.mdx?$/);

import { getBlogMetadata } from "@site/src/components/utils/blogPosts";

export default function LatestBlogPosts({
  tag,
  tags,
  mainTag, // A main tag like "Joomla" so we'll mainly filter on it wherever possible; used by RelatedBlogPostsd
  author,
  serie, // If the post is part of a serie, its name will be here
  count = 3,
  description = false,
  excludePermalink,
  random = false, // Randomize the order;
}) {
  const posts = getBlogMetadata();
  let filtered = posts;

  // mainTag is an optional custom key and if present, we'll display the list of posts having
  // that tag too
 if (mainTag) {
  const filteredByMainTag = posts.filter((post) => {
    const postTags = post.tags.map((t) =>
      typeof t === "string" ? t : t.label
    );
    return postTags.includes(mainTag);
  });

  if (filteredByMainTag.length > 0) {
    filtered = filteredByMainTag;
  } else if (tags && tags.length > 0) {
    filtered = posts.filter((post) => {
      const postTagLabels = post.tags.map((t) =>
        typeof t === "string" ? t : t.label
      );
      return postTagLabels.some((label) => tags.includes(label));
    });
  } else {
    filtered = [];
  }
  } else if (tags && tags.length > 0) {
    filtered = filtered.filter((post) => {
      const postTagLabels = post.tags.map((t) =>
        typeof t === "string" ? t : t.label
      );
      return postTagLabels.some((label) => tags.includes(label));
    });
  }

  if (tag) {
    filtered = filtered.filter((post) =>
      post.tags.some((t) => tag === (typeof t === "string" ? t : t.label))
    );
  }

  if (author && author.length > 0) {
    const authorList = Array.isArray(author) ? author : [author];
    filtered = filtered.filter((post) =>
      Array.isArray(post.authors)
        ? post.authors.some((a) => authorList.includes(a))
        : authorList.includes(post.authors)
    );
  }

  if (excludePermalink) {
    filtered = filtered.filter((post) => post.permalink !== excludePermalink);
  }

  const ordered = random ? [...filtered].sort(() => 0.5 - Math.random()) : filtered;
  const latest = ordered.slice(0, count);

  if (!latest.length) return <p>No related posts.</p>;

  return (
    <div className="row">
      {latest.map((post) => (
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
              <p style={{ color: "#888", fontSize: "0.95em", marginBottom: 8 }}>
                {post.date && (
                  <span>{new Date(post.date).toLocaleDateString()}</span>
                )}
              </p>
            </div>
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
  );
}
