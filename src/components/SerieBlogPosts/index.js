import React from "react";
import Link from "@docusaurus/Link";
import { getBlogMetadata } from "@site/src/components/utils/blogPosts";

export default function SerieBlogPosts({
  serie,
  excludePermalink = null,
  highlightCurrent = false,
}) {
  const posts = getBlogMetadata()
    .filter((post) => post.serie === serie)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  if (!posts.length) return null;

  return (
    <div style={{ marginBottom: "2rem" }}>
      <p>
        This article is part of the <strong>{serie}</strong> series:
      </p>
      <ul>
        {posts.map((post) => {
          const isCurrent = post.permalink === excludePermalink;

          return (
            <li key={post.permalink} style={{ marginBottom: "0.5rem" }}>
              {isCurrent ? (
                <span
                  style={{
                    fontWeight: "bold",
                    opacity: highlightCurrent ? 0.6 : 1,
                  }}
                >
                  {post.title}
                </span>
              ) : (
                <Link to={post.permalink}>{post.title}</Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
