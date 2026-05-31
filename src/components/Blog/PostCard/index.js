import Card from "@site/src/components/Card";
import CardBody from "@site/src/components/Card/CardBody";
import CardImage from "@site/src/components/Card/CardImage";
import Link from "@docusaurus/Link";
import PropTypes from "prop-types";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { formatPostDate } from "@site/src/components/Blog/utils/date";
import styles from "./styles.module.css";

export default function PostCard({
  post,
  layout = "big",
  defaultImage = "/img/default.jpg",
}) {
  const { permalink, image, title, description, date, counter } = post;
  const { i18n } = useDocusaurusContext();
  const formattedDate = formatPostDate(date, i18n.currentLocale);

  if (layout === "small") {
    return (
      <div className={`col col--4 ${styles.cardSmallWrapper}`}>
        <div className={`card ${styles.cardSmall}`}>
          <div className="card__image">
            <img
              src={image || defaultImage}
              alt={title}
              loading="lazy"
              className={styles.cardSmallImage}
            />
          </div>
          <div className={`card__body ${styles.cardSmallBody}`}>
            <h3>
              <Link to={permalink}>{title}</Link>
            </h3>
            {counter && <div className={styles.cardSmallCounter}>{counter}</div>}
            {formattedDate && <p className={styles.date}><span>{formattedDate}</span></p>}
          </div>
          <div className={`card__footer ${styles.cardSmallFooter}`}>
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
      <Card className={styles.cardEnhanced} shadow="md">
        <CardImage
          cardImageUrl={image || defaultImage}
          alt={title}
          title={title}
          className={styles.cardImageEnhanced}
        />
        <CardBody className={styles.cardBodyEnhanced}>
          <h3>
            <Link
              to={permalink}
              aria-label={`Read article: ${title}`}
              className={styles.cardTitleLink}
            >
              {title}&nbsp;→
            </Link>
          </h3>
          {description && <p className={styles.description}>{description}</p>}
          {counter && <p className={styles.counter}>{counter}</p>}
          {formattedDate && <p className={styles.date}><span>{formattedDate}</span></p>}
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
    date: PropTypes.string,
    counter: PropTypes.string,
  }).isRequired,
  layout: PropTypes.oneOf(["big", "small"]),
  defaultImage: PropTypes.string,
};
