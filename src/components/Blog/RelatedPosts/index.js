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
 * - Delegates the selection to `getRelatedPosts()` (mainTag, then fallback on shared tags,
 *   current post excluded, newest first) so this block and `MobileQuickLinks` stay in sync
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
import { getRelatedPosts } from "@site/src/components/Blog/utils/related";
import PostCard from "@site/src/components/Blog/PostCard";
import styles from "./styles.module.css";

export default function RelatedPosts({ count = 3, description = false }) {
  const { metadata } = useBlogPost();
  const mainTag = metadata.frontMatter.mainTag;
  const tags = metadata.frontMatter.tags || [];

  if (!mainTag && tags.length === 0) {
    return null;
  }

  const related = getRelatedPosts({
    mainTag,
    tags,
    excludePermalink: metadata.permalink,
    count,
  });

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
    <div className={styles.relatedPosts}>
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
    </div>
  );
}

RelatedPosts.propTypes = {
  /** Number of related posts to display */
  count: PropTypes.number,

  /** Whether to show post descriptions */
  description: PropTypes.bool,
};
