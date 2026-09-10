/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from "react";
import PropTypes from "prop-types";
import { useBlogPost } from "@docusaurus/plugin-content-blog/client";
import BlogPostItemHeaderTitle from "@theme/BlogPostItem/Header/Title";
import BlogPostItemHeaderInfo from "@theme/BlogPostItem/Header/Info";
import BlogPostItemHeaderAuthors from "@theme/BlogPostItem/Header/Authors";
import Breadcrumb from "@site/src/components/Blog/Breadcrumb";
import styles from "./styles.module.css";

export default function BlogPostItemHeader({ aiIcon, actions }) {
  const { metadata, isBlogPostPage } = useBlogPost();
  const { frontMatter } = metadata;

  // The `description:` front matter field is written for all 255 articles but was
  // only ever used as <meta name="description">. Rendered here as a standfirst, it
  // gives the first screen one explanatory sentence before the banner and the TLDR.
  //
  // Read from frontMatter, not from metadata.description: Docusaurus falls back to
  // an auto-generated excerpt of the body when the field is missing, and a future
  // post without a description would otherwise show its own first few words here.
  //
  // Article page only — in list view the card already renders the description.
  const standfirst = isBlogPostPage ? frontMatter.description : undefined;

  return (
    <header>
      <Breadcrumb />
      <BlogPostItemHeaderTitle />
      {standfirst && <p className={styles.standfirst}>{standfirst}</p>}
      <BlogPostItemHeaderInfo aiIcon={aiIcon} />
      {actions}
      <BlogPostItemHeaderAuthors />
    </header>
  );
}
BlogPostItemHeader.propTypes = {
  aiIcon: PropTypes.node,
  actions: PropTypes.node,
};
