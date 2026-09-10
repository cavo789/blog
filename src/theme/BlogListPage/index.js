import React from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import {
  HtmlClassNameProvider,
  ThemeClassNames,
  PageMetadata,
} from "@docusaurus/theme-common";
import BlogListPaginator from "@theme/BlogListPaginator";
import FollowFeed from "@site/src/components/FollowFeed";
import SearchMetadata from "@theme/SearchMetadata";
import Layout from "@theme/Layout";
import PostCard from "@site/src/components/Blog/PostCard";
import styles from "./styles.module.css";

function resolveImageUrl(frontMatterImage, permalink) {
  if (!frontMatterImage) return null;
  if (!frontMatterImage.startsWith("./")) return frontMatterImage;
  const slug = permalink.replace(/^\/blog\//, "").replace(/\/$/, "");
  return `/blog/${slug}/${frontMatterImage.replace("./", "")}`;
}

const metadataPropTypes = PropTypes.shape({
  blogDescription: PropTypes.string,
  blogTitle: PropTypes.string,
  totalCount: PropTypes.number,
});

function BlogListPageMetadata({ metadata }) {
  const { blogDescription, blogTitle } = metadata;
  return (
    <>
      <PageMetadata title={blogTitle} description={blogDescription} />
      <SearchMetadata tag="blog_posts_list" />
    </>
  );
}
BlogListPageMetadata.propTypes = {
  metadata: metadataPropTypes.isRequired,
};

function BlogListPageContent({ metadata, items }) {
  const posts = items.map(({ content: { metadata: m } }) => ({
    id: m.permalink,
    permalink: m.permalink,
    title: m.title,
    description: m.description,
    date: m.date,
    image: resolveImageUrl(m.frontMatter?.image, m.permalink),
    mainTag: m.frontMatter?.mainTag,
    readingTime: m.readingTime,
  }));

  return (
    <Layout>
      <main className={clsx("container", styles.blogListPage)}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>
            All posts
            <span className={styles.postCount}>{metadata.totalCount}</span>
          </h1>
          {/*
            The compact trigger, not the full card: a reader who lands on "all
            posts" came to browse. The site-wide feed is the machine-readable
            twin of this exact page, so the offer belongs here — just not loud
            enough to delay the list.
          */}
          <FollowFeed feedUrl="/blog/rss.xml" label="every new post" variant="inline" />
        </div>
        <div className={styles.cardsGrid}>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} layout="big" />
          ))}
        </div>
        <BlogListPaginator metadata={metadata} />
      </main>
    </Layout>
  );
}
BlogListPageContent.propTypes = {
  metadata: metadataPropTypes.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      content: PropTypes.shape({
        metadata: PropTypes.shape({
          permalink: PropTypes.string,
          title: PropTypes.string,
          description: PropTypes.string,
          date: PropTypes.string,
          readingTime: PropTypes.number,
          frontMatter: PropTypes.object,
        }),
      }),
    }),
  ).isRequired,
};

export default function BlogListPage(props) {
  return (
    <HtmlClassNameProvider
      className={clsx(
        ThemeClassNames.wrapper.blogPages,
        ThemeClassNames.page.blogListPage,
      )}
    >
      <BlogListPageMetadata {...props} />
      <BlogListPageContent {...props} />
    </HtmlClassNameProvider>
  );
}
