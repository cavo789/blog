/**
 * BlogPostItem/Content/index.jsx
 *
 * This component customizes the rendering of individual blog posts in Docusaurus.
 * It is swizzled from `@theme/BlogPostItem/Content` to allow advanced layout control.
 *
 * Key features:
 * - Extracts and displays the first image in the blog post as a header image.
 *   The original image is hidden from the main content to avoid duplication.
 * - Call the SeriesPosts component so, if the blog post is part of a series, we'll inject
 *   "This article is part of the xxxx series:" section
 * - Renders the rest of the blog content using MDX.
 * - Conditionally displays the `SeriesPosts` component to show related posts
 *   from the same series, only when viewing a full blog post (not in list view).
 *
 * This override was needed to be able to first display the banner of the article and, below,
 * the series info.
 */

import { useBlogPost } from "@docusaurus/plugin-content-blog/client";
import React, { useEffect, useRef, useState } from "react";
import MDXContent from "@theme/MDXContent";
import SeriesPosts from "@site/src/components/Blog/SeriesPosts/index.js";
import OldPostNotice from "@site/src/components/Blog/OldPostNotice/index.js";
import Updated from "@site/src/components/Blog/Updated/index.js";

export default function BlogPostContent({ children }) {
  const contentRef = useRef(null);
  const [firstImageSrc, setFirstImageSrc] = useState(null);

  const { metadata, isBlogPostPage } = useBlogPost();

  useEffect(() => {
    if (contentRef.current) {
      const img = contentRef.current.querySelector("img");
      if (img) {
        setFirstImageSrc(img.src);
        img.style.display = "none"; // hide original image
      }
    }
  }, []);

  return (
    <div>
      {firstImageSrc && (
        <img
          src={firstImageSrc}
          alt={metadata.title}
          loading="lazy"
          style={{ width: "100%", marginBottom: "1rem" }}
        />
      )}
      {/* Only display our SeriesPosts component on the post page; not the blog view */}
      {isBlogPostPage && (
        <>
          <OldPostNotice />
          <SeriesPosts
            series={metadata.frontMatter.series}
            excludePermalink={metadata.permalink}
            highlightCurrent={true}
          />
          <Updated updates={metadata.frontMatter.updates} />
        </>
      )}

      <div ref={contentRef}>
        <MDXContent>{children}</MDXContent>
      </div>

      {/* Only display our RelatedPosts and Bluesky components on the post page; not the blog view */}
      {isBlogPostPage && (
        <>
          <hr />
          <SeriesPosts
            series={metadata.frontMatter.series}
            excludePermalink={metadata.permalink}
            highlightCurrent={true}
          />
        </>
      )}
    </div>
  );
}
