import Link from '@docusaurus/Link';
import PropTypes from 'prop-types';
import { getBlogMetadata } from '@site/src/components/Blog/utils/posts';
import BlogPostCount from '@site/src/components/Blog/PostCount';
import PostCard from '@site/src/components/Blog/PostCard';
import Translate from '@docusaurus/Translate';

import styles from './styles.module.css';

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
          <PostCard
            key={post.permalink}
            post={description ? post : { ...post, description: null }}
            layout="big"
            lazyImage={index >= 3}
          />
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
