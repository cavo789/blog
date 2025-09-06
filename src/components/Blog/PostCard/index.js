/**
 * ♣️ PostCard component
 *
 * A reusable Docusaurus component that displays a blog post preview card.
 * It shows the post image (with fallback), title (as a link), and description.
 *
 * Accessibility:
 * - The title is wrapped in a semantic link with an aria-label for screen readers.
 * - The image includes alt and title attributes.
 *
 * Styling:
 * - Uses Infima utility classes for layout and spacing.
 * - Custom styles can be applied via `styles.module.css`.
 *
 * Location: src/components/Blog/PostCard/index.js
 */

import PropTypes from "prop-types";
import Link from "@docusaurus/Link";
import Card from "@site/src/components/Card";
import CardBody from "@site/src/components/Card/CardBody";
import CardImage from "@site/src/components/Card/CardImage";
import styles from "./styles.module.css";

/**
 * Renders a single blog post card with image, title, and description.
 *
 * @param {Object} props
 * @param {Object} props.post - Blog post metadata.
 * @param {string} props.defaultImage - Fallback image used when no image is provided.
 * @returns {JSX.Element}
 */
export default function PostCard({ post, defaultImage = "/img/default.jpg" }) {
  const { permalink, image, title, description, date } = post;
  console.log(post);

  return (
    <Card shadow="md">
      <CardImage
        cardImageUrl="/img/default.jpg" //{image || defaultImage}
        alt={title}
        title={title}
      />
      <CardBody className="padding-vert--md text--center" textAlign="center" style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}>
        {/*
            For accessibility purposes, it's better to only put the link on the title,
            not on the entire card
          */}
        <h3>
          <Link href={permalink} aria-label={`Read article: ${title}`}>{title}&nbsp;→</Link>
        </h3>
        {description && <p className={styles.description}>{description}</p>}

        <p
                    style={{
                      color: "#888",
                      fontSize: "0.95em",
                      marginBottom: 8,
                    }}
                  >
                    {date && (
                      <span>{new Date(date).toLocaleDateString()}</span>
                    )}
                  </p>
      </CardBody>
    </Card>
  );
}

PostCard.propTypes = {
  post: PropTypes.shape({
    permalink: PropTypes.string.isRequired,
    image: PropTypes.string,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
  }).isRequired,
  defaultImage: "/img/default.jpg",
};
