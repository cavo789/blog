/**
 * 🏠 HomeCard Component
 *
 * A reusable card component for showcasing homepage features or links.
 * Combines an image, title, description, and link into a styled card layout.
 *
 * Props:
 * - title (string): Title displayed on the card
 * - image (string): Filename of the image (located in `/img/homepage/`)
 * - link (string): URL to navigate to when the card is clicked
 * - description (string): Short description displayed below the title
 *
 * Behavior:
 * - Wraps content in a clickable card layout
 * - Uses `Card`, `CardImage`, and `CardBody` for modular structure
 * - Applies fade-in animation and responsive column layout
 *
 * Styling:
 * - Uses `styles.fade_in` for animation
 * - Applies Docusaurus utility classes: `col--2`, `margin-bottom--lg`
 *
 * Returns:
 * - A visually engaging card element for homepage or grid layouts
 */

import PropTypes from "prop-types";
import Card from '@site/src/components/Card';
import CardBody from '@site/src/components/Card/CardBody';
import CardImage from '@site/src/components/Card/CardImage';
import styles from "./styles.module.css";

export default function HomeCard({ title, image, link, description }) {
  // use col--2 for all cards on the same row row
  // by using col--4, three cards will be displayed in a row
  return (
    <div className={`${styles.fade_in} ${styles.card} card col col--3 margin-bottom--lg`}>
      <a href={link}>
        <Card>
          <CardImage cardImageUrl={`/img/homepage/${image}`} lazy={false} />
          <CardBody className="padding-vert--md text--center" textAlign='center' transform='uppercase'>
            <h3>{title}</h3>
            <p>{description}&nbsp;→</p>
          </CardBody>
        </Card>
      </a>
    </div>
  );
}

HomeCard.propTypes = {
  /** Title displayed on the card */
  title: PropTypes.string.isRequired,

  /** Image filename (relative to /img/homepage/) */
  image: PropTypes.string.isRequired,

  /** Destination URL for the card link */
  link: PropTypes.string.isRequired,

  /** Description text shown below the title */
  description: PropTypes.string.isRequired
};
