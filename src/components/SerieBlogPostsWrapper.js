import React from 'react';
import { useBlogPost } from '@docusaurus/plugin-content-blog/client';
import SerieBlogPosts from './SerieBlogPosts';

export default function SerieBlogPostsWrapper() {
  const { metadata } = useBlogPost();

  if (!metadata?.frontMatter?.serie) return null;

  return (
    <SerieBlogPosts
      serie={metadata.frontMatter.serie}
      excludePermalink={metadata.permalink}
      highlightCurrent={true}
    />
  );
}
