/**
 * 📰 LatestPosts Component
 *
 * Displays a list of the most recent blog posts, sorted by date in descending order.
 * Supports multiple layout styles: 'big', 'small', and 'bullet'.
 *
 * Props:
 * @param {number} [count=8] - Number of latest posts to display.
 * @param {boolean} [description=true] - Whether to show post descriptions.
 * @param {string} [layout='bullet'] - Layout style: 'big', 'small', or 'bullet'.
 *
 * Behavior:
 * - Fetches blog metadata using `getBlogMetadata`.
 * - Sorts posts by publication date (newest first).
 * - Displays up to `count` posts.
 * - In 'bullet' layout, renders a simple list with title, date, description, and tags.
 * - In 'big' or 'small' layout, uses the `PostCard` component for visual cards.
 * - Renders a fallback message if no posts are found.
 *
 * Dependencies:
 * - `getBlogMetadata`: Retrieves metadata from MDX blog posts.
 * - `PostCard`: Component used for card-based layouts.
 * - `PropTypes`: Used for prop validation.
 * - `styles.module.css`: Custom styles for bullet layout.
 *
 * Example usage:
 * <LatestPosts count={5} description={true} layout="bullet" />
 */

import { getBlogMetadata } from "@site/src/components/Blog/utils/posts";
import BlogPostCount from "@site/src/components/Blog/PostCount";
import PostCard from "@site/src/components/Blog/PostCard";
import PropTypes from "prop-types";
import styles from "./styles.module.css";

/**
 * Renders a formatted date string.
 * @param {Object} props
 * @param {string} props.date - The date string to format.
 * @param {string} props.layout - The layout variant ('big' or 'small').
 * @returns {JSX.Element | null}
 */
const FormattedDate = ({ date }) => {
  if (!date) {
    return null;
  }
  return (
    <span>
      {new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })}
    </span>
  );
};

export default function LatestPosts({
  count = 8,
  description = true,
  layout = "bullet",
}) {
  const posts = getBlogMetadata();

  // // Log posts that are missing a date
  // posts.forEach(post => {
  //   if (!post.date) {
  //     console.log(`⚠️ Post without a 'date' front matter: ${post.permalink}`);
  //   }
  // });

  // Sort posts by date in descending order
  const sortedPosts = posts.sort((a, b) => {
    // Use optional chaining to safely access date,
    // defaulting to a value (like 0) if it's undefined.
    const dateA = a.date ? new Date(a.date).getTime() : 0;
    const dateB = b.date ? new Date(b.date).getTime() : 0;
    return dateB - dateA;
  });

  // Take the N most recent posts
  const latestPosts = sortedPosts.slice(0, count);

  if (!latestPosts.length) {
    return <p>No recent posts found.</p>;
  }

  return (
    <>
      <h3 id="latest_posts">
        Check out my latest {latestPosts.length} post{latestPosts.length !== 1 ? "s" : ""}{" "}
        <a href="/blog">(or explore the full archive of <BlogPostCount /> posts)</a>
      </h3>

      {layout === "bullet" ? (
        <ul className={styles.bulletList}>
          {latestPosts.map((post) => (
            <li key={post.permalink} className={styles.bulletItem}>
              <a href={post.permalink} className={styles.bulletTitle}>
                <strong>{post.title}</strong>
              </a>
              {post.date && (
                <span className={styles.bulletDate}>
                  ({new Date(post.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })})
                </span>
              )}
              {description && post.description && (
                <p className={styles.bulletDescription}>{post.description}</p>
              )}
              {post.tags?.length > 0 && (
                <p className={styles.bulletTags}>
                  {post.tags.map((tag, index) => (
                    <span key={tag}>
                      {tag}
                    </span>
                  ))}
                </p>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div className="row">
          {latestPosts.map((post) => {
            const postToRender = description
              ? post
              : { ...post, description: null };

            return (
              <PostCard key={post.id} layout={layout} post={postToRender} />
            );
          })}
        </div>
      )}
    </>
  );
}

LatestPosts.propTypes = {
  /** Number of latest posts to display */
  count: PropTypes.number,
  /** Whether to show post descriptions */
  description: PropTypes.bool,
  /** Layout style for displaying posts */
  layout: PropTypes.oneOf(["big", "small", "bullet"]),
};
