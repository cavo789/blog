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
 */

import type { JSX } from "react";
import Link from "@docusaurus/Link";
import Translate from "@docusaurus/Translate";
import HOME_CARDS from "../../data/home_cards.js";
import styles from "./styles.module.css";
import Card from "@site/src/components/Card";
import CardBody from "@site/src/components/Card/CardBody";
import CardImage from "@site/src/components/Card/CardImage";

interface HomeCardItemProps {
  title: string;
  description: string;
  url: string;
  image: string;
  alt?: string;
  lazy: boolean;
}

const HomeCardItem = ({
  title,
  description,
  url,
  image,
  alt,
  lazy,
}: HomeCardItemProps): JSX.Element => (
  <Link to={url} className={styles.cardLink}>
    <Card>
      <CardImage
        className={styles.cardImage}
        cardImageUrl={`/img/homepage/${image}`}
        alt={alt || title}
        lazy={lazy}
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

export default function HomeCards(): JSX.Element {
  return (
    <section className={styles.cardsSection}>
      <h2>
        <Translate id="homepage.homeCards.title">Explore the site</Translate>
      </h2>
      <div className={styles.cardsGrid}>
        {HOME_CARDS.map((card, index) => (
          // Only the very first card sits above the fold on mobile (the grid collapses to a
          // single column below 600px — see styles.module.css). Lazy-loading it too was adding
          // a ~10s artificial LCP delay (TODO 0096); every other card is genuinely off-screen
          // on load, so it keeps lazy-loading.
          <HomeCardItem key={card.title} {...card} lazy={index !== 0} />
        ))}
      </div>
    </section>
  );
}
