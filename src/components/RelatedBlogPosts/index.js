import React from 'react';
import { useBlogPost } from '@docusaurus/plugin-content-blog/client';
import LatestBlogPosts from '@site/src/components/LatestBlogPosts/index.js';

export default function RelatedPosts({ count = 3, description = false }) {
  const { metadata } = useBlogPost();
  const currentPermalink = metadata.permalink;
  const mainTag = metadata.frontMatter.mainTag;
  const tags = metadata.frontMatter.tags || [];

  // If mainTag exists, use it; else fallback to tags list
  if (!mainTag && tags.length === 0) return null; // no tag to filter by

  return (
    <LatestBlogPosts
      mainTag={mainTag || null}   // pass mainTag or null
      tags={!mainTag ? tags : null}  // pass tags only if mainTag is absent
      excludePermalink={currentPermalink}
      count={count}
      description={description}
    />
  );
}