/**
 * 🔗 RelatedPosts Component
 *
 * Displays a list of related blog posts based on shared tags or a designated `mainTag`.
 * Designed for Docusaurus blogs to enhance content discoverability.
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

import type { JSX } from "react";
import { useBlogPost } from "@docusaurus/plugin-content-blog/client";
import Translate from "@docusaurus/Translate";
import { getRelatedPosts } from "@site/src/components/Blog/utils/related";
import PostCard from "@site/src/components/Blog/PostCard";
import styles from "./styles.module.css";

interface Props {
  /** Number of related posts to display */
  count?: number;
  /** Whether to show post descriptions */
  description?: boolean;
}

export default function RelatedPosts({
  count = 3,
  description = false,
}: Props): JSX.Element | null {
  const { metadata } = useBlogPost();
  // `mainTag` is a project-specific front matter field, so Docusaurus types it
  // as `unknown` — narrow it to what getRelatedPosts() expects.
  const mainTag = metadata.frontMatter.mainTag as string | undefined;
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
        <Translate id="blog.relatedPosts.noRelated">No related posts.</Translate>
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
            key={post.permalink}
            layout="small"
            post={description ? post : { ...post, description: null }}
          />
        ))}
      </div>
    </div>
  );
}
