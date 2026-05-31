import clsx from "clsx";
import {
  PageMetadata,
  HtmlClassNameProvider,
  ThemeClassNames,
  translateTagsPageTitle,
} from "@docusaurus/theme-common";
import BlogLayout from "@theme/BlogLayout";
import SearchMetadata from "@theme/SearchMetadata";
import Link from "@docusaurus/Link";
import ScrollToTopButton from "@site/src/components/ScrollToTopButton";
import MAIN_CARDS from "@site/src/data/main_tags.js";
import styles from "./styles.module.css";

function correctPermalink(permalink) {
  return permalink.replace("/blog/tags/tags/", "/blog/tags/");
}

export default function BlogTagsListPage({ tags, sidebar }) {
  const title = translateTagsPageTitle();

  // Docusaurus 3.9+ passes tags as TagsListItem[]; older builds pass an object.
  const tagsArray = (Array.isArray(tags) ? tags : Object.values(tags))
    .map((tag) => ({ ...tag, permalink: correctPermalink(tag.permalink) }))
    .sort((a, b) => b.count - a.count);

  // Build featured cards by matching MAIN_CARDS labels against actual tag data.
  const featuredCards = MAIN_CARDS.flatMap((card) => {
    const tagData = tagsArray.find(
      (t) => t.label.toLowerCase() === card.title.toLowerCase()
    );
    if (!tagData) return [];
    return [{ ...card, count: tagData.count, permalink: tagData.permalink }];
  });

  const featuredLabels = new Set(MAIN_CARDS.map((c) => c.title.toLowerCase()));

  return (
    <HtmlClassNameProvider
      className={clsx(
        ThemeClassNames.wrapper.blogPages,
        ThemeClassNames.page.blogTagsListPage
      )}
    >
      <PageMetadata title={title} />
      <SearchMetadata tag="blog_tags_list" />
      <BlogLayout>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>{title}</h1>
          <p className={styles.pageSubtitle}>
            {tagsArray.length} topics to explore
          </p>
        </div>

        {featuredCards.length > 0 && (
          <section className={styles.featuredSection}>
            <p className={styles.sectionTitle}>Featured topics</p>
            <div className={styles.featuredGrid}>
              {featuredCards.map((card) => (
                <Link
                  key={card.title}
                  to={card.permalink}
                  className={styles.featuredCard}
                >
                  <span className={styles.featuredIcon} aria-hidden="true">
                    {card.icon}
                  </span>
                  <span className={styles.featuredTitle}>{card.title}</span>
                  <span className={styles.featuredDescription}>
                    {card.description}
                  </span>
                  <span className={styles.featuredCount}>
                    {card.count} {card.count === 1 ? "article" : "articles"}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className={styles.allTagsSection}>
          <p className={styles.sectionTitle}>All topics</p>
          <div className={styles.tagCloud}>
            {tagsArray.map((tag) => (
              <Link
                key={tag.permalink}
                to={tag.permalink}
                className={clsx(
                  styles.tagPill,
                  featuredLabels.has(tag.label.toLowerCase()) &&
                    styles.tagPillFeatured
                )}
              >
                <span>{tag.label}</span>
                <span className={styles.tagCount}>{tag.count}</span>
              </Link>
            ))}
          </div>
        </section>
      </BlogLayout>
      <ScrollToTopButton />
    </HtmlClassNameProvider>
  );
}
