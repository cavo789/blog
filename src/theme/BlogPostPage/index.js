import React from "react";
import clsx from "clsx";
import {
  HtmlClassNameProvider,
  ThemeClassNames,
} from "@docusaurus/theme-common";
import {
  BlogPostProvider,
  useBlogPost,
} from "@docusaurus/plugin-content-blog/client";
import BlogLayout from "@theme/BlogLayout";
import BlogPostItem from "@theme/BlogPostItem";
import BlogPostPaginator from "@theme/BlogPostPaginator";
import BlogPostPageMetadata from "@theme/BlogPostPage/Metadata";
import StructuredData from "@site/src/components/StructuredData";
import BlogPostPageStructuredData from "@theme/BlogPostPage/StructuredData";
import TOC from "@theme/TOC";
import TOCCollapsible from "@theme/TOCCollapsible";
import ContentVisibility from "@theme/ContentVisibility";
// NEW: Import hook to track URL changes
import { useLocation } from "@docusaurus/router";

function BlogPostPageContent({ sidebar, children }) {
  const { metadata, toc } = useBlogPost();
  const { nextItem, prevItem, frontMatter } = metadata;
  const {
    hide_table_of_contents: hideTableOfContents,
    toc_min_heading_level: tocMinHeadingLevel,
    toc_max_heading_level: tocMaxHeadingLevel,
  } = frontMatter;

  // NEW: Get current location to force re-render on hash change
  const location = useLocation();

  return (
    <BlogLayout
      sidebar={sidebar}
      toc={
        !hideTableOfContents && toc.length > 0 ? (
          <TOC
            toc={toc}
            minHeadingLevel={tocMinHeadingLevel}
            maxHeadingLevel={tocMaxHeadingLevel}
          />
        ) : undefined
      }
    >
      <ContentVisibility metadata={metadata} />

      {/* MOBILE TOC IMPLEMENTATION
        We use 'key={location.hash}' to force the component to re-mount
        when the user clicks an anchor link. This effectively resets the
        component to its default 'collapsed' state, closing the menu automatically.
      */}
      {!hideTableOfContents && toc.length > 0 && (
        <TOCCollapsible
          key={location.hash}
          toc={toc}
          minHeadingLevel={tocMinHeadingLevel}
          maxHeadingLevel={tocMaxHeadingLevel}
          className={clsx(ThemeClassNames.docs.docTocMobile, "blog-toc-mobile")}
        />
      )}

      <BlogPostItem>{children}</BlogPostItem>

      {(nextItem || prevItem) && (
        <BlogPostPaginator nextItem={nextItem} prevItem={prevItem} />
      )}
    </BlogLayout>
  );
}

export default function BlogPostPage(props) {
  const BlogPostContent = props.content;

  return (
    <BlogPostProvider content={props.content} isBlogPostPage>
      <InnerBlogPostPage {...props} BlogPostContent={BlogPostContent} />
    </BlogPostProvider>
  );
}

function InnerBlogPostPage({ sidebar, BlogPostContent }) {
  const { metadata } = useBlogPost();

  return (
    <HtmlClassNameProvider
      className={clsx(
        ThemeClassNames.wrapper.blogPages,
        ThemeClassNames.page.blogPostPage
      )}
    >
      <BlogPostPageMetadata />
      <BlogPostPageStructuredData />
      {metadata && <StructuredData metadata={metadata} />}
      <BlogPostPageContent sidebar={sidebar}>
        <BlogPostContent />
      </BlogPostPageContent>
    </HtmlClassNameProvider>
  );
}
