import React from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import {
  HtmlClassNameProvider,
  ThemeClassNames,
  PageMetadata,
} from "@docusaurus/theme-common";
import BlogListPaginator from "@theme/BlogListPaginator";
import Link from "@docusaurus/Link";
import { useBaseUrlUtils } from "@docusaurus/useBaseUrl";
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

/**
 * Docusaurus's own pagination URL scheme, reproduced because the locale-aware list below has to
 * build links the blog plugin never computed: page 1 is the blog root, page N is `<root>/page/N`
 * (`paginateBlogPosts()` in @docusaurus/plugin-content-blog). Feeding anything else to
 * `<BlogListPaginator>` would produce links to routes that do not exist.
 */
function pagePermalink(basePageUrl, page) {
  return page > 1 ? `${basePageUrl}/page/${page}` : basePageUrl;
}

/** `/fr/blog/page/7` -> `/fr/blog`. The base carries the locale, so it is never hardcoded. */
function basePageUrlOf(permalink) {
  return permalink.replace(/\/page\/\d+\/?$/, "").replace(/\/$/, "");
}

const metadataPropTypes = PropTypes.shape({
  blogDescription: PropTypes.string,
  blogTitle: PropTypes.string,
  totalCount: PropTypes.number,
  // The pagination half of Docusaurus's BlogPaginatedMetadata: read to re-paginate the
  // translated corpus over the routes the blog plugin generated. See BlogListPageContent.
  page: PropTypes.number,
  permalink: PropTypes.string,
  postsPerPage: PropTypes.number,
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
  // here is not enough: the pagination was computed upstream over the WHOLE corpus, so the
  // slice handed to page N has no relation to the Nth page of the translated corpus, and
  // `metadata.totalCount` / `previousPage` / `nextPage` all describe the English blog.
  //
  // So we rebuild the list from our own locale-aware corpus AND re-paginate it here, with the
  // same page size Docusaurus used (`metadata.postsPerPage`) so that page 1 keeps its URL and
  // the routes the plugin generated stay usable.
  //
  // The route set is still the English one, so a locale whose corpus is shorter has surplus
  // pages at the end (`/fr/blog/page/18` when only 9 pages have content). They render the
  // empty state below; `plugins/i18n-seo-guard` marks them `noindex` and the sitemap's
  // `createSitemapItems` drops them. Nothing links to them. All of this collapses to a no-op
  // the day the corpus is fully translated — see TODO 0124.
  const { isDefaultLocale, readingTimeOf } = useTranslationState();
  const { withBaseUrl } = useBaseUrlUtils();
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

  // `postsPerPage` is whatever the blog plugin resolved (it turns the `"ALL"` option into the
  // post count), so reading it back is what keeps this in step with docusaurus.config.js.
  const { page, postsPerPage } = metadata;
  const totalPages = Math.max(1, Math.ceil(localePosts.length / postsPerPage));
  const basePageUrl = basePageUrlOf(metadata.permalink);

  const pagePosts = isDefaultLocale
    ? localePosts
    : localePosts.slice((page - 1) * postsPerPage, page * postsPerPage);

  // Rebuilt rather than reused: `metadata`'s own neighbours point into the English pagination.
  const paginatorMetadata = isDefaultLocale
    ? metadata
    : {
        ...metadata,
        totalCount: localePosts.length,
        totalPages,
        previousPage: page > 1 ? pagePermalink(basePageUrl, page - 1) : undefined,
        nextPage: page < totalPages ? pagePermalink(basePageUrl, page + 1) : undefined,
      };

  const isSurplusPage = pagePosts.length === 0;

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
        {isSurplusPage ? (
          <p className={styles.emptyPage}>
            {/* Unlike the search widget's empty state, this one is a whole page
                a reader landed on, so the illustration can carry it. */}
            <img
              src={withBaseUrl("/img/meerkat/emojis/emotion_confused.webp")}
              alt={translate({
                id: "blog.listPage.emptyPageImageAlt",
                message: "A puzzled meerkat.",
              })}
              className={styles.emptyPageImage}
              width={140}
              height={140}
              loading="lazy"
            />
            <Translate id="blog.listPage.emptyPage">
              There is nothing on this page.
            </Translate>{" "}
            {page > 1 && (
              <Link to={basePageUrl}>
                <Translate id="blog.listPage.backToFirstPage">
                  Back to the first page
                </Translate>
              </Link>
            )}
          </p>
        ) : (
          <>
            <div className={styles.cardsGrid}>
              {pagePosts.map((post) => (
                <PostCard key={post.id} post={post} layout="big" />
              ))}
            </div>
            <BlogListPaginator metadata={paginatorMetadata} />
          </>
        )}
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
