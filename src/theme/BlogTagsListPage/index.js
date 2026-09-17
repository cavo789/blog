import PropTypes from "prop-types";
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
import MAIN_CARDS from "@site/src/data/main_tags.js";
import styles from "./styles.module.css";
import Translate, { translate } from "@docusaurus/Translate";
import { useBlogMetadata } from "@site/src/components/Blog/utils/posts";
import { useTranslationState } from "@site/src/components/Blog/utils/translations";
import TranslationCoverage from "@site/src/components/Blog/TranslationCoverage";

// Collapses the doubled `tags/tags` segment Docusaurus produces here. Matches on the segment
// alone rather than on a leading "/blog/": under a non-default locale the permalink is prefixed
// (`/fr/blog/tags/tags/...`), and anchoring on "/blog/" silently left it doubled, which broke
// every tag link in that locale (TODO 0119).
/**
 * Article front matter carries tag SLUGS (`tags: [docker]`) while Docusaurus's tag objects carry
 * LABELS ("Docker"). Try the label first, then the slug read back off the permalink.
 */
function countBySlug(counts, tag) {
  const slug = String(tag.permalink ?? "")
    .split("/")
    .filter(Boolean)
    .pop();
  return counts.get(slug) ?? 0;
}

function correctPermalink(permalink) {
  return permalink.replace("/tags/tags/", "/tags/");
}

// eslint-disable-next-line no-unused-vars -- sidebar is part of Docusaurus's BlogTagsListPage prop contract, unused here
export default function BlogTagsListPage({ tags, sidebar }) {
  const title = translateTagsPageTitle();

  // Docusaurus 3.9+ passes tags as TagsListItem[]; older builds pass an object.
  // Docusaurus counts every post carrying a tag, English corpus included — so under `fr` this
  // page announced "97 articles" for Docker while only a handful are readable. Recount from the
  // locale-aware corpus, and drop tags that end up empty: a topic card leading to an empty list
  // is worse than no card. No-op on the default locale, where the recount matches Docusaurus's.
  const { isDefaultLocale } = useTranslationState();
  const localePosts = useBlogMetadata();

  const localeCounts = new Map();
  for (const post of localePosts) {
    for (const tag of post.tags) {
      const key = typeof tag === "string" ? tag : tag.label;
      localeCounts.set(key, (localeCounts.get(key) ?? 0) + 1);
    }
  }

  const tagsArray = (Array.isArray(tags) ? tags : Object.values(tags))
    .map((tag) => ({ ...tag, permalink: correctPermalink(tag.permalink) }))
    .map((tag) =>
      isDefaultLocale
        ? tag
        : {
            ...tag,
            count: localeCounts.get(tag.label) ?? countBySlug(localeCounts, tag),
          },
    )
    .filter((tag) => tag.count > 0)
    .sort((a, b) => b.count - a.count);

  // Featured cards are matched on the tag SLUG, taken from `card.url`, never on the label:
  // labels are localized in tags.yml ("Artificial Intelligence (AI)" becomes "Intelligence
  // artificielle (IA)"), so matching English titles would silently drop every renamed card
  // under a non-default locale.
  //
  // Title and description likewise come from the TAG, not from MAIN_CARDS — tags.yml is
  // localized and MAIN_CARDS is not. The hardcoded values stay as a fallback for a tag that has
  // no description of its own.
  const slugOfCard = (card) => String(card.url).split("/").filter(Boolean).pop();
  const slugOfTag = (tag) => String(tag.permalink).split("/").filter(Boolean).pop();

  const featuredCards = MAIN_CARDS.flatMap((card) => {
    const tagData = tagsArray.find((t) => slugOfTag(t) === slugOfCard(card));
    if (!tagData) return [];

    return [
      {
        ...card,
        title: tagData.label ?? card.title,
        description: tagData.description ?? card.description,
        count: tagData.count,
        permalink: tagData.permalink,
      },
    ];
  });

  const featuredSlugs = new Set(MAIN_CARDS.map(slugOfCard));

  return (
    <HtmlClassNameProvider
      className={clsx(
        ThemeClassNames.wrapper.blogPages,
        ThemeClassNames.page.blogTagsListPage,
      )}
    >
      <PageMetadata
        title={title}
        description={`Browse all ${tagsArray.length} topics covered on this blog — Docker, WSL, Bash, PHP, AI and more.`}
      />
      <SearchMetadata tag="blog_tags_list" />
      <BlogLayout>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>{title}</h1>
          <p className={styles.pageSubtitle}>
            <Translate
              id="blog.tagsListPage.subtitle"
              values={{ count: tagsArray.length }}
            >
              {"{count} topics to explore"}
            </Translate>
          </p>
          {/*
            Pedagogy, not a call to action: this page lists subjects, it does not
            offer one. The subscribing happens on the tag's own page, where a
            single feed is actually on the table. A feed icon on each of the 49
            cards would just noise up the grid for the same information.
          */}
          <p className={styles.feedHint}>
            <Translate id="blog.tagsListPage.feedHint">
              Every topic here has its own RSS feed —
            </Translate>{" "}
            <Link to="/follow">
              <Translate id="blog.tagsListPage.feedHint.link">
                follow just the ones you care about
              </Translate>
            </Link>
            .
          </p>
        </div>

        {/* Renders nothing on `en`. The recount above narrows this page to the tags that have a
            translated article — 11 of 49 under `fr` — so the subtitle reads "11 topics to explore"
            for a blog that covers 49. */}
        <TranslationCoverage variant="listing" />

        {featuredCards.length > 0 && (
          <section className={styles.featuredSection}>
            <p className={styles.sectionTitle}>
              <Translate id="blog.tagsListPage.featured">Featured topics</Translate>
            </p>
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
                  <span className={styles.featuredDescription}>{card.description}</span>
                  <span className={styles.featuredCount}>
                    <Translate
                      id="blog.tagsListPage.articleCount"
                      values={{ count: card.count }}
                    >
                      {"{count} articles"}
                    </Translate>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className={styles.allTagsSection}>
          <p className={styles.sectionTitle}>
            <Translate id="blog.tagsListPage.all">All topics</Translate>
          </p>
          <div className={styles.tagCloud}>
            {tagsArray.map((tag) => (
              <Link
                key={tag.permalink}
                to={tag.permalink}
                className={clsx(
                  styles.tagPill,
                  featuredSlugs.has(slugOfTag(tag)) && styles.tagPillFeatured,
                )}
              >
                <span>{tag.label}</span>
                <span className={styles.tagCount}>{tag.count}</span>
              </Link>
            ))}
          </div>
        </section>
      </BlogLayout>
    </HtmlClassNameProvider>
  );
}
BlogTagsListPage.propTypes = {
  tags: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
  sidebar: PropTypes.object,
};
