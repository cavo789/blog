/**
 * MainTags Component
 *
 * Displays a grid of main topic cards using metadata from the MAIN_CARDS array.
 * Each card includes an icon, title, description, and a link to a specific tag page.
 *
 * Dependencies:
 * - MAIN_CARDS: Array of card objects with { title, description, url, icon }
 * - styles.module.css: Scoped CSS module for layout and styling
 * - Docusaurus <Link /> for internal navigation
 *
 * Example usage:
 * <MainTags />
 */

import { useMemo, type JSX, type ReactNode } from "react";
import Link from "@docusaurus/Link";
import Translate from "@docusaurus/Translate";
import styles from "./styles.module.css";
import MAIN_CARDS from "../../data/main_tags.js";
import MAIN_CARDS_FR from "../../data/main_tags.fr.js";
import { useTranslationState } from "@site/src/components/Blog/utils/translations";
import { useBlogMetadata } from "@site/src/components/Blog/utils/posts";
import { createSlug } from "@site/src/components/Blog/utils/slug";

/** Keyed by card url — see src/data/main_tags.fr.js. */
const LOCALIZED: Record<
  string,
  Record<string, { title: string; description: string }>
> = {
  fr: MAIN_CARDS_FR,
};

interface CardProps {
  title: string;
  description: string;
  url: string;
  icon: ReactNode;
}

const Card = ({ title, description, url, icon }: CardProps): JSX.Element => (
  <Link to={url} className={styles.cardLink}>
    <article className={styles.cardItem}>
      <span className={styles.cardIcon} aria-hidden="true">
        {icon}
      </span>
      <h3 className={styles.cardTitle}>{title}</h3>
      <p className={styles.cardDescription}>{description}</p>
    </article>
  </Link>
);

/** `/blog/tags/docker` -> `docker`. The card's url is what identifies the tag it points at. */
function tagSlugOf(url: string): string {
  return url.replace(/\/+$/, "").split("/").pop() ?? "";
}

export default function MainTags(): JSX.Element {
  const { currentLocale } = useTranslationState();

  // `useBlogMetadata()` is already narrowed to the current locale, which is the whole point
  // here: under `fr` only the translated articles count, so a card survives exactly when its
  // tag page has something to show. Slugifying `post.tags` mirrors `TagArticlesPage`'s own
  // filter — match on anything else and a card could promise articles the destination then
  // fails to list.
  const posts = useBlogMetadata();

  const cards = useMemo(() => {
    const tagsWithPosts = new Set<string>();
    for (const post of posts) {
      for (const tag of post.tags ?? []) {
        tagsWithPosts.add(createSlug(typeof tag === "string" ? tag : tag.label));
      }
    }

    // Overrides are keyed by `url`, the stable identifier — `title` is what changes between
    // locales, so it cannot be the key. Resolved inside the memo: rebuilt at module scope on
    // every render, the object would be a new reference each time and defeat it.
    const overrides = LOCALIZED[currentLocale] ?? {};

    return MAIN_CARDS.map((card) => ({ ...card, ...(overrides[card.url] ?? {}) })).filter(
      (card) => tagsWithPosts.has(tagSlugOf(card.url)),
    );
  }, [posts, currentLocale]);

  return (
    <section className={styles.cardsSection}>
      <h2>
        <Translate id="homepage.mainTags.title">Explore the main topics</Translate>
      </h2>
      <div className={styles.cardsGrid}>
        {cards.length > 0 ? (
          cards.map((card) => <Card key={card.url} {...card} />)
        ) : (
          <p>
            <Translate id="homepage.mainTags.noTags">No tags to display.</Translate>
          </p>
        )}
      </div>

      <div className={styles.seeMoreContainer}>
        <Link to="/blog/tags" className={styles.seeMoreLink}>
          <Translate id="homepage.mainTags.seeAll">See all tags</Translate> →
        </Link>
      </div>
    </section>
  );
}
