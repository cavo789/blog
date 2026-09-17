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
import TranslationCoverage from "@site/src/components/Blog/TranslationCoverage";
import { useBlogMetadata } from "@site/src/components/Blog/utils/posts";
import {
  slugFromPermalink,
  useTranslationState,
} from "@site/src/components/Blog/utils/translations";
import styles from "./styles.module.css";
import Translate, { translate } from "@docusaurus/Translate";

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
  // In a non-default locale, `items` is whatever Docusaurus paginated — which includes every
  // untranslated article, since its i18n falls back to the English source. Filtering `items`
  // here is not enough: the pagination was computed upstream, so page 2 could come back empty
  // and `metadata.totalCount` would lie. We therefore rebuild the list from our own
  // locale-aware corpus and drop the paginator for that locale.
  //
  // Acceptable while the translated set is small. Once it outgrows one page, this needs real
  // pagination over the filtered corpus — see TODO 0119, lot F.
  const { isDefaultLocale, readingTimeOf } = useTranslationState();
  const translatedPosts = useBlogMetadata();

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

  const localePosts = isDefaultLocale
    ? posts
    : [...translatedPosts]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map((post) => ({
          id: post.permalink,
          permalink: post.permalink,
          title: post.title,
          description: post.description,
          date: post.date,
          image: post.image,
          mainTag: post.mainTag,
          // Measured on the translated file by translations-manifest-plugin: the metadata this
          // list is rebuilt from carries no reading time of its own.
          readingTime: readingTimeOf(slugFromPermalink(post.permalink)),
        }));

  return (
    <Layout>
      <main className={clsx("container", styles.blogListPage)}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>
            <Translate id="blog.listPage.allPosts">All posts</Translate>
            <span className={styles.postCount}>
              {isDefaultLocale ? metadata.totalCount : localePosts.length}
            </span>
          </h1>
          {/*
            The compact trigger, not the full card: a reader who lands on "all
            posts" came to browse. The site-wide feed is the machine-readable
            twin of this exact page, so the offer belongs here — just not loud
            enough to delay the list.
          */}
          <FollowFeed
            feedUrl="/blog/rss.xml"
            label={translate({
              id: "blog.followFeed.label.everyNewPost",
              message: "every new post",
            })}
            variant="inline"
          />
        </div>
        <TranslationCoverage variant="listing" />
        <div className={styles.cardsGrid}>
          {localePosts.map((post) => (
            <PostCard key={post.id} post={post} layout="big" />
          ))}
        </div>
        {isDefaultLocale && <BlogListPaginator metadata={metadata} />}
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
