import React, { useState } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import { useAutoAnimate } from "@formkit/auto-animate/react";
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
import { useTagLabel } from "@site/src/components/Blog/utils/tagsI18n";
import {
  slugFromPermalink,
  useTranslationState,
} from "@site/src/components/Blog/utils/translations";
import styles from "./styles.module.css";
import Translate, { translate } from "@docusaurus/Translate";

/** How many `mainTag` pills to surface before the "all tags" link takes over. */
const FILTER_BAR_TAG_COUNT = 10;

/**
 * The `mainTag`s to offer as quick filters, most-represented first.
 *
 * Computed from whatever corpus is already locale-filtered (`allPosts` — translated-only on
 * `fr`), so a tag with zero translated articles never gets a pill nobody can click into.
 */
function topTagsOf(posts, limit) {
  const counts = new Map();
  for (const post of posts) {
    if (!post.mainTag) continue;
    counts.set(post.mainTag, (counts.get(post.mainTag) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag]) => tag);
}

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
  const tagLabel = useTagLabel();
  const [activeTag, setActiveTag] = useState(null);
  const [gridRef] = useAutoAnimate({ duration: 200 });

  // Full corpus, already locale-filtered by the hook (translated-only on `fr`) — needed because
  // the tag pills must filter across everything, not just the current page's `items`, which is
  // all Docusaurus's own SSG pagination ever hands this component.
  const allPosts = useBlogMetadata();
  const topTags = topTagsOf(allPosts, FILTER_BAR_TAG_COUNT);

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
    : [...allPosts]
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

  // A tag pill switches to a flat, unpaginated view of the whole corpus for that tag: even the
  // most-used tag (~22 articles) reads fine as one grid, and it sidesteps re-deriving pagination
  // URLs that don't match the routes Docusaurus actually generated for this page (see the long
  // comment at the top of this function for why that's delicate on `fr`).
  //
  // `readingTime` for a filtered post: Docusaurus supplies it only for the current page's
  // `items`, and `readingTimeOf` (translations-manifest-plugin) only covers `fr` — so an English
  // post pulled in from outside the current page has no reading time available at all.
  // `PostCard` already renders that line conditionally, so it's simply omitted rather than
  // guessed at.
  const readingTimeByPermalink = new Map(
    items.map(({ content: { metadata: m } }) => [m.permalink, m.readingTime]),
  );

  const filteredPosts = activeTag
    ? [...allPosts]
        .filter((post) => post.mainTag === activeTag)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map((post) => ({
          id: post.permalink,
          permalink: post.permalink,
          title: post.title,
          description: post.description,
          date: post.date,
          image: post.image,
          mainTag: post.mainTag,
          readingTime: isDefaultLocale
            ? readingTimeByPermalink.get(post.permalink)
            : readingTimeOf(slugFromPermalink(post.permalink)),
        }))
    : [];

  const displayPosts = activeTag ? filteredPosts : pagePosts;
  const showPaginator = !activeTag;

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
        {topTags.length > 0 && (
          <div
            className={styles.tagFilterBar}
            role="group"
            aria-label={translate({
              id: "blog.listPage.filterBarLabel",
              message: "Filter posts by tag",
            })}
          >
            <button
              type="button"
              className={clsx(styles.tagPill, activeTag === null && styles.tagPillActive)}
              aria-pressed={activeTag === null}
              onClick={() => setActiveTag(null)}
            >
              <Translate id="blog.listPage.filterAll">all</Translate>
            </button>
            {topTags.map((tag) => (
              <button
                key={tag}
                type="button"
                className={clsx(
                  styles.tagPill,
                  activeTag === tag && styles.tagPillActive,
                )}
                aria-pressed={activeTag === tag}
                onClick={() => setActiveTag(tag)}
              >
                {tagLabel(tag)}
              </button>
            ))}
            <Link to="/blog/tags" className={styles.allTagsLink}>
              <Translate id="blog.listPage.allTagsLink">all tags →</Translate>
            </Link>
          </div>
        )}
        <TranslationCoverage variant="listing" />
        {isSurplusPage && !activeTag ? (
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
            <div ref={gridRef} className={styles.cardsGrid}>
              {displayPosts.map((post) => (
                <PostCard key={post.id} post={post} layout="big" />
              ))}
            </div>
            {showPaginator && <BlogListPaginator metadata={paginatorMetadata} />}
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
