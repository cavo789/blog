import { getBlogMetadata } from "@site/src/components/Blog/utils/posts";
import PropTypes from "prop-types";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

/**
 * BlogPostCount Component
 *
 * This React component displays the total number of published blog posts.
 * It uses the `getBlogMetadata` utility to retrieve metadata for all blog posts,
 * filters out drafts, and renders the count in a span element.
 *
 * Usage:
 * Simply include <BlogPostCount /> in any part of your React application
 * where you'd like to show the number of published blog articles.
 *
 * @param {Object} props
 * @param {string} [props.className] - Optional classname
 * @returns {JSX.Element} A span element showing the blog post count.
 */
export default function BlogPostCount({ className }) {
  const { i18n } = useDocusaurusContext();
  const count = getBlogMetadata().filter((post) => !post.draft).length;

  return (
    <span className={className}>
      {count.toLocaleString(i18n.currentLocale)}
    </span>
  );
}

BlogPostCount.propTypes = {
  className: PropTypes.string
};
