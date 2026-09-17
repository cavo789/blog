/**
 * 📚 SeriesPosts Component
 *
 * Displays a list of blog posts that belong to the same series.
 * Useful for linking related articles together in a Docusaurus blog.
 *
 * Behavior:
 * - Fetches blog metadata via `getBlogMetadata()`
 * - Filters posts by series name
 * - Sorts posts chronologically
 * - Highlights or links each post depending on whether it's the current one
 *
 * Styling:
 * - Uses scoped CSS from `styles.module.css`
 *
 * Returns:
 * - A styled list of blog posts in the same series, or null if none found.
 */

import type { JSX } from "react";
import Link from "@docusaurus/Link";
import Translate from "@docusaurus/Translate";
import clsx from "clsx";
import Details from "@site/src/components/Details";
import { useBlogMetadata } from "@site/src/components/Blog/utils/posts";
import { createSlug } from "@site/src/components/Blog/utils/slug";
import { useSeriesLocalizer } from "@site/src/components/Blog/utils/seriesI18n";

import styles from "./styles.module.css";

interface Props {
  /** The name of the blog series to display */
  series: string;
  /** Permalink of the current post to exclude from linking */
  excludePermalink?: string | null;
  /** Whether to visually highlight the current post */
  highlightCurrent?: boolean;
}

export default function SeriesPosts({
  series,
  excludePermalink = null,
  highlightCurrent = true,
}: Props): JSX.Element | null {
  const posts = useBlogMetadata()
    .filter((post) => post.series === series)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // `series` is the English key — it matches the front matter and builds the slug. Only the link
  // text is localized, so a French article stops announcing an English series name.
  const seriesLabel = useSeriesLocalizer()(series)?.label ?? series;

  if (!posts.length) return null;

  return (
    <div className={styles.seriesBlogPost}>
      <Details
        label={
          <Translate
            id="blog.seriesPosts.intro"
            values={{
              seriesLink: (
                <Link href={`/series/${createSlug(series)}`}>{seriesLabel}</Link>
              ),
            }}
          >
            {"This article is part of the {seriesLink} series:"}
          </Translate>
        }
      >
        <ul>
          {posts.map((post) => {
            const isCurrent = post.permalink === excludePermalink;

            return (
              <li key={post.permalink}>
                {isCurrent ? (
                  <span
                    className={clsx(
                      styles.currentPost,
                      highlightCurrent && styles.currentPostDimmed,
                    )}
                  >
                    {post.title}
                  </span>
                ) : (
                  <Link to={post.permalink}>{post.title}</Link>
                )}
              </li>
            );
          })}
        </ul>
      </Details>
    </div>
  );
}
