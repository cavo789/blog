import React from 'react';
import clsx from 'clsx';
import {blogPostContainerID} from '@docusaurus/utils-common';
import {useBlogPost} from '@docusaurus/plugin-content-blog/client';
import MDXContent from '@theme/MDXContent';
// highlight-next-line
import OldPostNotice from "@site/src/components/Blog/OldPostNotice/index.js";

export default function BlogPostItemContent({children, className}) {
  const {isBlogPostPage} = useBlogPost();
  return (
    // highlight-next-line
    <>
      // highlight-next-line
      <OldPostNotice />
      <div
        // This ID is used for the feed generation to locate the main content
        id={isBlogPostPage ? blogPostContainerID : undefined}
        className={clsx('markdown', className)}>
        <MDXContent>{children}</MDXContent>
      </div>
    // highlight-next-line
    </>
  );
}
