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
import { useBlogPost } from "@docusaurus/plugin-content-blog/client";
import Translate from "@docusaurus/Translate";
import { getBlogMetadata } from "@site/src/components/Blog/utils/posts";
import PostCard from "@site/src/components/Blog/PostCard";

export default function RelatedPosts({ count = 3, description = false }) {
  const { metadata } = useBlogPost();
  const currentPermalink = metadata.permalink;
  const mainTag = metadata.frontMatter.mainTag;
  const tags = metadata.frontMatter.tags || [];

  if (!mainTag && tags.length === 0) {
    return null;
  }

  const posts = getBlogMetadata();
  let filtered = [];

  const hasTag = (post, targetTag) =>
    post.tags.some((t) => (typeof t === "string" ? t : t.label) === targetTag);

  const hasAnyTag = (post, targetTags) =>
    post.tags.some((t) =>
      targetTags.includes(typeof t === "string" ? t : t.label)
    );

  // Prefer mainTag if available
  if (mainTag) {
    filtered = posts.filter((post) => hasTag(post, mainTag));
  }

  // Fallback to shared tags if mainTag yielded no results (or wasn't present)
  if (filtered.length === 0 && tags.length > 0) {
    filtered = posts.filter((post) => hasAnyTag(post, tags));
  }

  // Exclude current post
  filtered = filtered.filter((post) => post.permalink !== currentPermalink);

  // Sort by date (newest first) to avoid hydration mismatch caused by Math.random()
  filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

  const related = filtered.slice(0, count);

  if (!related.length) {
    return (
      <p>
        <Translate id="blog.relatedPosts.noRelated">
          No related posts.
        </Translate>
      </p>
    );
  }

  return (
    <>
      <h3>
        <Translate id="blog.relatedPosts.title">Related posts</Translate>
      </h3>
      <div className="row">
        {related.map((post) => (
          <PostCard
            key={post.id}
            layout="small"
            post={description ? post : { ...post, description: null }}
          />
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
