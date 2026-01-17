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

import Card from "@site/src/components/Card";
import CardBody from "@site/src/components/Card/CardBody";
import CardImage from "@site/src/components/Card/CardImage";
import Link from "@docusaurus/Link";
import PropTypes from "prop-types";
import styles from "./styles.module.css";

/**
 * Renders a formatted date string.
 * @param {Object} props
 * @param {string} props.date - The date string to format.
 * @param {string} props.layout - The layout variant ('big' or 'small').
 * @returns {JSX.Element | null}
 */
const FormattedDate = ({ date, layout }) => {
  if (!date) {
    return null;
  }
  return (
    <p
      className={layout === "small" ? "" : styles.date}
      style={
        layout === "small"
          ? { color: "#888", fontSize: "0.95em", marginBottom: 8 }
          : {}
      }
    >
      <span>
        {new Date(date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </span>
    </p>
  );
};

/**
 * @param {Object} props
 * @param {Object} props.post - Blog post metadata.
 * @param {string} [props.layout='big'] - The layout variant: 'big' or 'small'.
 * @param {string} props.defaultImage - Fallback image used when no image is provided.
 * @returns {JSX.Element}
 */
export default function PostCard({
  post,
  layout = "big",
  defaultImage = "/img/default.jpg",
}) {
  const { permalink, image, title, description, date } = post;

  if (layout === "small") {
    return (
      <div
        className="col col--4"
        style={{ marginBottom: "2rem", display: "flex" }}
      >
        <div
          className="card"
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <div className="card__image">
            <img
              src={image || defaultImage}
              alt={title}
              style={{
                width: "100%",
                height: 180,
                objectFit: "cover",
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8,
              }}
            />
          </div>
          <div className="card__body" style={{ flex: 1 }}>
            <h3>
              <Link to={permalink}>{title}</Link>
            </h3>
            {description && (
              <div
                style={{
                  color: "#6c63ff",
                  fontWeight: "bold",
                  marginBottom: 6,
                }}
              >
                {description}
              </div>
            )}
            <FormattedDate date={date} layout={layout} />
          </div>
          <div className="card__footer" style={{ textAlign: "right" }}>
            <Link className="button button--primary button--sm" to={permalink}>
              Read more
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Default "big" layout
  return (
    <div className="col col--3 margin-bottom--lg">
      <Card shadow="md">
        <CardImage
          cardImageUrl={image || defaultImage}
          alt={title}
          title={title}
        />
        <CardBody className="padding-vert--md text--center" textAlign="center">
          <h3>
            <Link href={permalink} aria-label={`Read article: ${title}`}>
              {title}&nbsp;→
            </Link>
          </h3>
          {description && <p className={styles.description}>{description}</p>}
          <FormattedDate date={date} layout={layout} />
        </CardBody>
      </Card>
    </div>
  );
}

PostCard.propTypes = {
  post: PropTypes.shape({
    permalink: PropTypes.string.isRequired,
    image: PropTypes.string,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
  }).isRequired,
  layout: PropTypes.oneOf(["big", "small"]),
  defaultImage: PropTypes.string,
};
