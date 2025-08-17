import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";

const blogPosts = require.context("../../../blog", true, /\.mdx?$/);

function getBlogMetadata() {
  return (
    blogPosts
      .keys()
      .map((key) => {
        const post = blogPosts(key);

        // Don't process blog posts in draft or the unlisted ones
        if (post.frontMatter.draft || post.frontMatter.unlisted) {
          return null;
        }

        // Get the directory of the blog post (like /blog/2025/08/17)
        const dir = key.replace(/\/index\.mdx?$/, "").replace(/^\.\//, "");

        // Build the slug
        let permalink;
        if (post.frontMatter.slug) {
          permalink = post.frontMatter.slug.startsWith("/")
            ? post.frontMatter.slug
            : `/blog/${post.frontMatter.slug.replace(/^\//, "")}`;
        } else {
          permalink = `/blog/${dir}/`;
        }

        // Get the image
        let imageUrl = post.frontMatter.image;
        if (imageUrl && imageUrl.startsWith("./")) {
          imageUrl = `/blog/${dir}/${imageUrl.replace("./", "")}`;
        }

        // Return the metadata of the blog post.
        // mainTag is a custom key so make sure to initialize to null if not present
        return {
          title: post.frontMatter.title,
          description: post.frontMatter.description,
          image: imageUrl,
          permalink,
          tags: post.frontMatter.tags || [],
          mainTag: post.frontMatter.mainTag || null,
          authors: post.frontMatter.authors || [],
          date: post.frontMatter.date,
        };
      })
      // ✅ Filter out nulls (skipped posts)
      .filter(Boolean)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  );
}

function getExcerptWords(text, wordCount = 20) {
  if (!text) return "";
  const words = text.split(/\s+/);
  // Shorten a text and add an ellipsis
  return (
    words.slice(0, wordCount).join(" ") + (words.length > wordCount ? "…" : "")
  );
}

export default function LatestBlogPosts({
  tag,
  tags,
  mainTag, // A main tag like "Joomla" so we'll mainly filter on it wherever possible
  author,
  count = 3,
  description = false,
  excludePermalink,
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
  const latest = filtered.slice(0, count);

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
