/**
 * 🔗 RelatedPosts Component
 *
 * Displays a list of related blog posts based on shared tags or a designated `mainTag`.
 * Designed for Docusaurus blogs to enhance content discoverability.
 *
 * Props:
 * - count (number): Maximum number of related posts to display (default: 3)
 * - description (boolean): Whether to show post descriptions if available
 *
 * Behavior:
 * - Uses `useBlogPost()` to get current post metadata
 * - Fetches blog metadata via `getBlogMetadata()`
 * - Filters blog posts using `mainTag` or fallback to shared tags
 * - Excludes the current post from the results
 * - Randomizes and limits the number of displayed posts
 *
 * Styling:
 * - Uses Docusaurus grid and card classes
 * - Inline styles for layout and visual polish
 *
 * Returns:
 * - A responsive grid of related blog post cards, or a fallback message if none found
 */

import PropTypes from "prop-types";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { useBlogPost } from "@docusaurus/plugin-content-blog/client";
import { getBlogMetadata } from "@site/src/components/Blog/utils/posts";
import PostCard from "@site/src/components/Blog/PostCard";

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
          <PostCard key={post.id} layout="small" post={post} />
        ))}
      </div>
    </>
  );
}

RelatedPosts.propTypes = {
  /** Number of related posts to display */
  count: PropTypes.number,

  /** Whether to show post descriptions */
  description: PropTypes.bool,
};
