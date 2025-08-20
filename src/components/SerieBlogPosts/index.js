/**
 * 📚 SerieBlogPosts Component
 *
 * Displays a list of blog posts that belong to the same series.
 * Useful for linking related articles together in a Docusaurus blog.
 *
 * Props:
 * - serie (string): The name of the series to filter blog posts by.
 * - excludePermalink (string|null): Optional permalink to exclude (usually the current post).
 * - highlightCurrent (boolean): If true, dims the current post title for visual emphasis.
 *
 * Behavior:
 * - Fetches blog metadata via `getBlogMetadata()`
 * - Filters posts by series name
 * - Sorts posts chronologically
 * - Highlights or links each post depending on whether it's the current one
 *
 * Styling:
 * - Uses scoped CSS from `styles.module.css`
 *
 * Returns:
 * - A styled list of blog posts in the same series, or null if none found.
 */

import Link from "@docusaurus/Link";
import { getBlogMetadata } from "@site/src/components/utils/blogPosts";

import styles from "./styles.module.css";

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
    <div className={styles.seriesBlogPost}>
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
