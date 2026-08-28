/**
 * 📱 MobileQuickLinks Component
 *
 * A compact, text-only list of a few related articles, displayed on mobile only, right
 * below the TL;DR of a blog post.
 *
 * Why it exists:
 * The blog sidebar (`blogSidebarCount: "ALL"`) is by far the biggest pool of internal links
 * on the site, but Docusaurus hides it below 997px. A mobile reader landing on a standalone
 * article from a search engine had nothing to click before the very bottom of the page,
 * after the whole content and the engagement widgets.
 *
 * Behavior:
 * - Renders nothing outside a full blog post page: the TL;DR also shows up in the blog list
 *   view, where every card would otherwise get its own block
 * - Renders nothing for a post belonging to a series: `SeriesPosts` already sits at the top
 *   of those posts, and two navigation blocks in a row would be one too many
 * - Renders nothing when no related post is found
 * - Text only, no image and no description, so it stays a navigation hint rather than an ad
 *   and pushes the content down as little as possible
 *
 * Because the markup is rendered server-side and merely hidden by CSS on wide screens, it
 * costs no layout shift.
 *
 * Note: must be rendered inside a blog post context (`useBlogPost`).
 */

import type { JSX } from "react";
import Link from "@docusaurus/Link";
import Translate, { translate } from "@docusaurus/Translate";
import { useBlogPost } from "@docusaurus/plugin-content-blog/client";
import { getRelatedPosts } from "@site/src/components/Blog/utils/related";
import styles from "./styles.module.css";

interface Props {
  /** Number of related posts to display */
  count?: number;
}

export default function MobileQuickLinks({ count = 3 }: Props): JSX.Element | null {
  const { metadata, isBlogPostPage } = useBlogPost();
  const { frontMatter, permalink } = metadata;

  if (!isBlogPostPage || frontMatter.series) {
    return null;
  }

  const related = getRelatedPosts({
    // `mainTag` is a project-specific front matter field → Docusaurus types it
    // as `unknown`; narrow it to what getRelatedPosts() expects.
    mainTag: frontMatter.mainTag as string | undefined,
    tags: frontMatter.tags || [],
    excludePermalink: permalink,
    count,
  });

  if (!related.length) {
    return null;
  }

  return (
    <nav
      className={styles.mobileQuickLinks}
      aria-label={translate({
        id: "blog.mobileQuickLinks.label",
        message: "Related articles",
      })}
    >
      <p className={styles.title}>
        <Translate id="blog.mobileQuickLinks.title">On the same topic</Translate>
      </p>
      <ul className={styles.list}>
        {related.map((post) => (
          <li className={styles.item} key={post.permalink}>
            <Link to={post.permalink}>{post.title}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
