import Link from '@docusaurus/Link';
import PropTypes from 'prop-types';
import { getBlogMetadata } from '@site/src/components/Blog/utils/posts';
import BlogPostCount from '@site/src/components/Blog/PostCount';
import Translate from '@docusaurus/Translate';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

import Card from '@site/src/components/Card';
import CardBody from '@site/src/components/Card/CardBody';
import CardImage from '@site/src/components/Card/CardImage';

import styles from './styles.module.css';

/**
 * Renders a formatted date string in "Month Day, Year" format.
 * @param {Object} props
 * @param {string} props.date - ISO date string to format
 * @returns {JSX.Element|null}
 */
const FormattedDate = ({ date }) => {
  const { i18n } = useDocusaurusContext();
  if (!date) return null;
  return (
    <span>
      {new Date(date).toLocaleDateString(i18n.currentLocale, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })}
    </span>
  );
};

/**
 * Displays the latest blog posts in a card grid layout.
 *
 * @param {Object} props
 * @param {number} [props.count=9] - Number of posts to display
 * @param {boolean} [props.description=true] - Whether to show post descriptions
 * @returns {JSX.Element}
 */
export default function LatestPosts({
  count = 9,
  description = true,
}) {
  const posts = getBlogMetadata();

  const sortedPosts = posts
    .filter((p) => p.date)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, count);

  if (!sortedPosts.length) {
    return (
      <p>
        <Translate id="blog.latestPosts.noPosts">No recent posts found.</Translate>
      </p>
    );
  }

  return (
    <section className={styles.cardsSection}>
      <h2 className={styles.sectionTitle}>
        <Translate
          id="blog.latestPosts.header"
          values={{
            count: sortedPosts.length,
            total: <BlogPostCount />,
            s: sortedPosts.length !== 1 ? "s" : "",
          }}
        >
          {"Latest {count} post{s} (out of {total} total)"}
        </Translate>
      </h2>

      <div className={styles.cardsGrid}>
        {sortedPosts.map((post) => (
          <Link key={post.id} to={post.permalink} className={styles.cardLink}>
            <Card>
              {post.image && (
                <CardImage
                  cardImageUrl={post.image}
                  alt={post.title}
                  lazy={false}
                />
              )}
              <CardBody
                className="padding-vert--md text--center"
                textAlign="center"
                transform="uppercase"
              >
                <h3>{post.title}</h3>
                {description && <p>{post.description || ""} →</p>}
                <FormattedDate date={post.date} />
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>

      <div className={styles.seeMoreContainer}>
        <Link to="/blog" className={styles.seeMoreLink}>
          <Translate id="blog.latestPosts.seeAll">See all articles</Translate> →
        </Link>
      </div>
    </section>
  );
}

LatestPosts.propTypes = {
  count: PropTypes.number,
  description: PropTypes.bool
};
