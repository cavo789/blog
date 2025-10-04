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
 *
 * Example card object:
 * {
 *   title: "Performance",
 *   description: "Tips to optimize your app",
 *   url: "/blog/tags/performance",
 *   icon: "⚡"
 * }
 */

import Link from "@docusaurus/Link";
import styles from "./styles.module.css";
import MAIN_CARDS from "../../data/main_tags.js";

const Card = ({ title, description, url, icon }) => (
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

export default function MainTags() {
  return (
    <section className={styles.cardsSection}>
      <h2>Explore the main topics</h2>
      <div className={styles.cardsGrid}>
        {MAIN_CARDS?.length > 0 ? (
          MAIN_CARDS.map((card) => <Card key={card.title} {...card} />)
        ) : (
          <p>No tags to display.</p>
        )}
      </div>

      <div className={styles.seeMoreContainer}>
        <Link to="/blog/tags" className={styles.seeMoreLink}>
          See all tags →
        </Link>
      </div>
    </section>
  );
}
