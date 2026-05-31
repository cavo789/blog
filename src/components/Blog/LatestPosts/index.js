import Link from '@docusaurus/Link';
import PropTypes from 'prop-types';
import { getBlogMetadata } from '@site/src/components/Blog/utils/posts';
import { formatPostDate } from '@site/src/components/Blog/utils/date';
import BlogPostCount from '@site/src/components/Blog/PostCount';
import Translate from '@docusaurus/Translate';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

import Card from '@site/src/components/Card';
import CardBody from '@site/src/components/Card/CardBody';
import CardImage from '@site/src/components/Card/CardImage';

import styles from './styles.module.css';

export default function LatestPosts({
  count = 9,
  description = true,
}) {
  const posts = getBlogMetadata();
  const { i18n } = useDocusaurusContext();

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
      <h2>
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
        {sortedPosts.map((post, index) => (
          <Link key={post.id} to={post.permalink} className={styles.cardLink}>
            <Card>
              {post.image && (
                <CardImage
                  cardImageUrl={post.image}
                  alt={post.title}
                  lazy={index >= 3}
                />
              )}
              <CardBody
                className="padding-vert--md text--center"
                textAlign="center"
              >
                <h3>{post.title}</h3>
                {description && <p>{post.description || ""} →</p>}
                <span>{formatPostDate(post.date, i18n.currentLocale)}</span>
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
