import React from 'react';
import clsx from 'clsx';
import {useBlogPost} from '@docusaurus/plugin-content-blog/client';
import BlogPostItemContainer from '@theme/BlogPostItem/Container';
import BlogPostItemHeader from '@theme/BlogPostItem/Header';
import BlogPostItemContent from '@theme/BlogPostItem/Content';
import BlogPostItemFooter from '@theme/BlogPostItem/Footer';

// Our relatedBlogPost component
import RelatedBlogPosts from '@site/src/components/RelatedBlogPosts/index.js';

// Our BlueSky component
import BlueSky from "@site/src/components/BlueSky/index.js";

// apply a bottom margin in list view
function useContainerClassName() {
  const {isBlogPostPage} = useBlogPost();
  return !isBlogPostPage ? 'margin-bottom--xl' : undefined;
}
export default function BlogPostItem({children, className}) {
  // We need to retrieve the isBlogPostPage flag
  const { metadata, isBlogPostPage } = useBlogPost();
  const containerClassName = useContainerClassName();
  return (
    <BlogPostItemContainer className={clsx(containerClassName, className)}>

      <BlogPostItemHeader />
      <BlogPostItemContent>{children}</BlogPostItemContent>
      <BlogPostItemFooter />

      {/* Only display our RelatedBlogPosts and BlueSky components on the post page; not the blog view */}
      {isBlogPostPage && (
        <>
          <RelatedBlogPosts count="6" description="false" />
          <BlueSky metadata={metadata} />
        </>
      )}

    </BlogPostItemContainer>
  );
}
