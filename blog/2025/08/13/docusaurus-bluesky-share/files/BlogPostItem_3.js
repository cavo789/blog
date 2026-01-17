import React from "react";
import clsx from "clsx";
import { useBlogPost } from "@docusaurus/plugin-content-blog/client";
import BlogPostItemContainer from "@theme/BlogPostItem/Container";
import BlogPostItemHeader from "@theme/BlogPostItem/Header";
import BlogPostItemContent from "@theme/BlogPostItem/Content";
import BlogPostItemFooter from "@theme/BlogPostItem/Footer";

// highlight-next-line
// import our Bluesky component
// highlight-next-line
import Bluesky from "@site/src/components/Bluesky/index.js";

// apply a bottom margin in list view
function useContainerClassName() {
  const { isBlogPostPage } = useBlogPost();
  return !isBlogPostPage ? "margin-bottom--xl" : undefined;
}

export default function BlogPostItem({ children, className }) {
  // highlight-next-line
  // We need to retrieve the isBlogPostPage flag
  // highlight-next-line
  const { metadata, isBlogPostPage } = useBlogPost();
  const containerClassName = useContainerClassName();
  return (
    <BlogPostItemContainer className={clsx(containerClassName, className)}>
      <BlogPostItemHeader />
      <BlogPostItemContent>{children}</BlogPostItemContent>
      <BlogPostItemFooter />
      // highlight-next-line
      {/* Only display Bluesky components on the post page; not the blog view */}
      // highlight-next-line
      {isBlogPostPage && <Bluesky metadata={metadata} />}
    </BlogPostItemContainer>
  );
}
