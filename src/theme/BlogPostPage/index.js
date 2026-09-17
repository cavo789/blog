import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import { HtmlClassNameProvider, ThemeClassNames } from "@docusaurus/theme-common";
import { BlogPostProvider, useBlogPost } from "@docusaurus/plugin-content-blog/client";
import BlogLayout from "@theme/BlogLayout";
import BlogPostItem from "@theme/BlogPostItem";
import ReadingProgress from "@site/src/components/ReadingProgress";
import BlogPostPaginator from "@theme/BlogPostPaginator";
import BlogPostPageMetadata from "@theme/BlogPostPage/Metadata";
import StructuredData from "@site/src/components/StructuredData";
import OpenGraphArticle from "@site/src/components/OpenGraphArticle";
import MarkdownAlternate from "@site/src/components/MarkdownAlternate";
import BlogPostPageStructuredData from "@theme/BlogPostPage/StructuredData";
import TOC from "@theme/TOC";
import TOCCollapsible from "@theme/TOCCollapsible";
import ContentVisibility from "@theme/ContentVisibility";
// NEW: Import hook to track URL changes
import { useLocation } from "@docusaurus/router";
import { useBlogMetadata } from "@site/src/components/Blog/utils/posts";
import {
  slugFromPermalink,
  useTranslationState,
} from "@site/src/components/Blog/utils/translations";

/**
 * Previous/next article, restricted to what the current locale can actually show.
 *
 * Docusaurus computes `prevItem`/`nextItem` over the whole blog, English sources included —
 * i18n falls back to them for every untranslated article. So on `/fr/` the "Older post" link at
 * the bottom of a translated article almost always led to an English page: with 5 of 257
 * articles translated, the chronological neighbour is untranslated nearly every time.
 *
 * On a non-default locale the neighbours are recomputed over the translated articles only, in
 * the same newest-first order Docusaurus uses (`prevItem` is the newer post). `useBlogMetadata()`
 * already filters to those articles AND overlays their translated titles, so the labels come out
 * in French too. The default locale keeps Docusaurus's own values untouched.
 */
function useLocaleNeighbours(metadata) {
  const { isDefaultLocale } = useTranslationState();
  const posts = useBlogMetadata();

  if (isDefaultLocale) {
    return { prevItem: metadata.prevItem, nextItem: metadata.nextItem };
  }

  const sorted = [...posts].sort(
    (a, b) =>
      new Date(b.date) - new Date(a.date) || a.permalink.localeCompare(b.permalink),
  );
  const current = slugFromPermalink(metadata.permalink);
  const index = sorted.findIndex((post) => slugFromPermalink(post.permalink) === current);
  if (index === -1) return { prevItem: undefined, nextItem: undefined };

  const toItem = (post) => post && { title: post.title, permalink: post.permalink };
  return { prevItem: toItem(sorted[index - 1]), nextItem: toItem(sorted[index + 1]) };
}

function BlogPostPageContent({ sidebar, children }) {
  const { metadata, toc } = useBlogPost();
  const { frontMatter } = metadata;
  const { nextItem, prevItem } = useLocaleNeighbours(metadata);
  const {
    hide_table_of_contents: hideTableOfContents,
    toc_min_heading_level: tocMinHeadingLevel,
    toc_max_heading_level: tocMaxHeadingLevel,
  } = frontMatter;

  // NEW: Get current location to force re-render on hash change
  const location = useLocation();

  const [tocHidden, setTocHidden] = useState(false);
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (y > lastY && y > 80) setTocHidden(true);
      else if (y < lastY) setTocHidden(false);
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
      <ReadingProgress />
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
          className={clsx(
            ThemeClassNames.docs.docTocMobile,
            "blog-toc-mobile",
            tocHidden && "blog-toc-mobile--hidden",
          )}
        />
      )}

      <BlogPostItem>{children}</BlogPostItem>

      {(nextItem || prevItem) && (
        <BlogPostPaginator nextItem={nextItem} prevItem={prevItem} />
      )}
    </BlogLayout>
  );
}
BlogPostPageContent.propTypes = {
  sidebar: PropTypes.object,
  children: PropTypes.node,
};

export default function BlogPostPage(props) {
  const BlogPostContent = props.content;

  return (
    <BlogPostProvider content={props.content} isBlogPostPage>
      <InnerBlogPostPage {...props} BlogPostContent={BlogPostContent} />
    </BlogPostProvider>
  );
}
BlogPostPage.propTypes = {
  content: PropTypes.elementType.isRequired,
};

function InnerBlogPostPage({ sidebar, BlogPostContent }) {
  const { metadata, assets } = useBlogPost();

  return (
    <HtmlClassNameProvider
      className={clsx(
        ThemeClassNames.wrapper.blogPages,
        ThemeClassNames.page.blogPostPage,
      )}
    >
      <BlogPostPageMetadata />
      <BlogPostPageStructuredData />
      <OpenGraphArticle />
      <MarkdownAlternate />
      {metadata && <StructuredData metadata={metadata} assets={assets} />}
      <BlogPostPageContent sidebar={sidebar}>
        <BlogPostContent />
      </BlogPostPageContent>
    </HtmlClassNameProvider>
  );
}
InnerBlogPostPage.propTypes = {
  sidebar: PropTypes.object,
  BlogPostContent: PropTypes.elementType.isRequired,
};
