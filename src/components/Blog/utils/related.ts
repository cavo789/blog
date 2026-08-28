/**
 * getRelatedPosts
 *
 * Shared selection logic for "you may also like" links. Extracted from the `RelatedPosts`
 * component so several surfaces (bottom-of-page cards, mobile quick links, ...) pick the
 * same articles instead of each re-implementing the rules.
 *
 * Selection rules, in order:
 * - Prefer posts sharing the current post `mainTag`
 * - Fall back to posts sharing any of the current post tags
 * - Exclude the current post itself
 * - Sort by date, newest first — a deterministic order avoids the hydration mismatch a
 *   random pick would cause
 *
 * Returns an array of blog metadata objects (possibly empty), never null.
 */

import { getBlogMetadata, type BlogPostMetadata, type BlogTag } from "./posts";

// Tags may be plain strings (frontmatter) or objects (Docusaurus normalized tags)
const tagLabel = (tag: BlogTag): string => (typeof tag === "string" ? tag : tag.label);

export function getRelatedPosts({
  mainTag = null,
  tags = [],
  excludePermalink = null,
  count = 3,
}: {
  mainTag?: string | null;
  tags?: BlogTag[];
  excludePermalink?: string | null;
  count?: number;
}): BlogPostMetadata[] {
  if (!mainTag && tags.length === 0) {
    return [];
  }

  const posts = getBlogMetadata();
  let filtered: BlogPostMetadata[] = [];

  if (mainTag) {
    filtered = posts.filter((post) => post.tags.some((tag) => tagLabel(tag) === mainTag));
  }

  if (filtered.length === 0 && tags.length > 0) {
    filtered = posts.filter((post) => post.tags.some((tag) => tags.includes(tagLabel(tag))));
  }

  return filtered
    .filter((post) => post.permalink !== excludePermalink)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, count);
}
