import type { JSX } from "react";
import Link from "@docusaurus/Link";
import { useBlogPost } from "@docusaurus/plugin-content-blog/client";
import {
  buildBreadcrumbTrail,
  type BreadcrumbItem,
} from "@site/src/components/Blog/utils/breadcrumb";
import styles from "./styles.module.css";

/**
 * Breadcrumb component
 *
 * Renders the article's position in the blog hierarchy at the very top of the
 * post header: `Home > mainTag > series > title`.
 *
 * Why it exists: 176 articles out of 255 belong to a series, and a reader
 * landing mid-series from a search engine had no signal of where they were in
 * that path. The same trail also feeds the `BreadcrumbList` JSON-LD emitted by
 * `src/components/StructuredData`, which is what makes Google print
 * `avonture.be > docker > lazydocker` under the result instead of the raw URL.
 *
 * Both are built from `buildBreadcrumbTrail()` so the visible trail and the
 * structured data can never drift apart.
 *
 * Article page only: in list view the cards already carry their own tag badge,
 * and a breadcrumb per card would be noise.
 *
 * Location: src/components/Blog/Breadcrumb/index.tsx
 */
export default function Breadcrumb(): JSX.Element | null {
  const { metadata, isBlogPostPage } = useBlogPost();

  if (!isBlogPostPage) return null;

  const frontMatter = metadata.frontMatter as Record<string, unknown>;

  const trail: BreadcrumbItem[] = buildBreadcrumbTrail({
    title: metadata.title,
    mainTag: frontMatter?.mainTag as string | undefined,
    series: frontMatter?.series as string | undefined,
  });

  // "Home" plus the title alone is not a hierarchy worth drawing.
  if (trail.length < 3) return null;

  return (
    <nav className={styles.breadcrumb} aria-label="Breadcrumb">
      <ol className={styles.list}>
        {trail.map((item, index) => {
          const isLast = index === trail.length - 1;
          return (
            <li key={`${item.label}-${index}`} className={styles.item}>
              {item.href && !isLast ? (
                <Link to={item.href} className={styles.link}>
                  {item.label}
                </Link>
              ) : (
                <span className={styles.current} aria-current="page">
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
