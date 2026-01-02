/**
 * HomeCards Component
 *
 * Renders a grid of homepage navigation cards using metadata from the HOME_CARDS array.
 * Each card includes an image, title, description, and a link to a target URL.
 *
 * Dependencies:
 * - HOME_CARDS: Array of card objects with { title, description, url, image, alt }
 * - Card, CardBody, CardImage: Reusable layout components
 * - styles.module.css: Scoped CSS module for layout and styling
 *
 * Example usage:
 * <HomeCards />
 *
 * Example card object:
 * {
 *   title: "Docs",
 *   description: "Learn how to use the framework",
 *   url: "/docs",
 *   image: "docs.png",
 *   alt: "Documentation"
 * }
 */

import Link from "@docusaurus/Link";
import Translate from "@docusaurus/Translate";
import PropTypes from "prop-types";
import HOME_CARDS from "../../data/home_cards.js";
import styles from "./styles.module.css";
import Card from "@site/src/components/Card";
import CardBody from "@site/src/components/Card/CardBody";
import CardImage from "@site/src/components/Card/CardImage";

const HomeCardItem = ({ title, description, url, image, alt }) => (
  <Link to={url} className={styles.cardLink}>
    <Card>
      <CardImage
        cardImageUrl={`/img/homepage/${image}`}
        alt={alt || title}
        lazy={false}
      />
      <CardBody
        className="padding-vert--md text--center"
        textAlign="center"
        transform="uppercase"
      >
        <h3>{title}</h3>
        <p>{description} →</p>
      </CardBody>
    </Card>
  </Link>
);

HomeCardItem.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
  image: PropTypes.string.isRequired,
  alt: PropTypes.string,
};

export default function HomeCards() {
  return (
    <section className={styles.cardsSection}>
      <h2 className={styles.sectionTitle}>
        <Translate id="homepage.homeCards.title">Explore the site</Translate>
      </h2>
      <div className={styles.cardsGrid}>
        {HOME_CARDS.map((card) => (
          <HomeCardItem key={card.title} {...card} />
        ))}
      </div>
    </section>
  );
}
