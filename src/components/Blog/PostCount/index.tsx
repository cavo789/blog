import type { JSX } from "react";
import { getBlogMetadata } from "@site/src/components/Blog/utils/posts";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

interface Props {
  /** Optional classname */
  className?: string;
}

/**
 * Displays the total number of published blog posts.
 *
 * Usage: simply include <BlogPostCount /> anywhere you'd like to show the
 * number of published blog articles.
 */
export default function BlogPostCount({ className }: Props): JSX.Element {
  const { i18n } = useDocusaurusContext();
  const count = getBlogMetadata().length;

  return (
    <span className={className}>
      {count.toLocaleString(i18n.currentLocale)}
    </span>
  );
}
