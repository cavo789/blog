import { getBlogMetadata } from "@site/src/components/Blog/utils/posts";
import PropTypes from "prop-types";

/**
 * BlogPostCount Component
 *
 * This React component displays the total number of published blog posts.
 * It uses the `getBlogMetadata` utility to retrieve metadata for all blog posts,
 * filters out drafts, and renders the count in a paragraph element.
 *
 * Usage:
 * Simply include <BlogPostCount /> in any part of your React application
 * where you'd like to show the number of published blog articles.
 *
 * Example output:
 * "We have published 42 articles on our blog!"
 *
 * @param {Object} props
 * @param {Object} props.className - Optional classname
 * @returns {JSX.Element} A paragraph element showing the blog post count.
 */
export default function BlogPostCount({ className }) {
  const count = getBlogMetadata().filter((post) => !post.draft).length;

  return (
    <p className={className}>
      We have published <strong>{count}</strong> articles on our blog!
    </p>
  );
}

BlogPostCount.propTypes = {
  className: PropTypes.string
};
