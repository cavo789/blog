import { getBlogMetadata } from "@site/src/components/Blog/utils/posts";

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
 * @returns {JSX.Element} A paragraph element showing the blog post count.
 */
export default function BlogPostCount() {
  const count = getBlogMetadata().filter((post) => !post.draft).length;

  return (
    <p>
      We have published <strong>{count}</strong> articles on our blog!
    </p>
  );
}
