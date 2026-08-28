/**
 * BlogPostItem/Content/index.jsx
 *
 * This component customizes the rendering of individual blog posts in Docusaurus.
 * It is swizzled from `@theme/BlogPostItem/Content` to allow advanced layout control.
 *
 * Key features:
 * - Extracts and displays the first image in the blog post as a header image.
 *   The original image is hidden from the main content to avoid duplication.
 * - Wraps that header image in a hero block themed with the banner's own auto-extracted
 *   accent color (src/data/postColors.generated.js), mirroring the treatment on series pages
 *   (src/components/Blog/Series) so each post's own page has a bit of its banner's character
 *   instead of every post page looking identical.
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
import PropTypes from "prop-types";
import MDXContent from "@theme/MDXContent";
import SeriesPosts from "@site/src/components/Blog/SeriesPosts";
import OldPostNotice from "@site/src/components/Blog/OldPostNotice";
import Updated from "@site/src/components/Blog/Updated";
import { hexToRgba } from "@site/src/components/Blog/utils/color";
import POST_COLORS from "@site/src/data/postColors.generated.js";
import styles from "./styles.module.css";

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

  const accentColor = POST_COLORS[metadata.frontMatter.image];
  const heroStyle = accentColor
    ? {
        "--post-accent-solid": hexToRgba(accentColor, 1),
        "--post-accent-glow-light": hexToRgba(accentColor, 0.35),
        "--post-accent-glow-dark": hexToRgba(accentColor, 0.55),
      }
    : undefined;

  return (
    <div>
      {firstImageSrc && (
        <div className={styles.postHero} style={heroStyle}>
          <img
            src={firstImageSrc}
            alt={metadata.title}
            loading="lazy"
            className={styles.postBanner}
          />
        </div>
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

      <div ref={contentRef} className={styles.postContent}>
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
BlogPostContent.propTypes = {
  children: PropTypes.node,
};
