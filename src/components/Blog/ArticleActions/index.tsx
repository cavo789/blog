import type { JSX } from "react";
import CopyAsMarkdown from "@site/src/components/CopyAsMarkdown";
import FollowFeed from "@site/src/components/FollowFeed";
import { createSlug } from "@site/src/components/Blog/utils/slug";
import { getTagLabel } from "@site/src/data/tags";
import styles from "./styles.module.css";

interface Props {
  metadata: {
    permalink: string;
    frontMatter?: { mainTag?: string | null };
  };
}

/**
 * The horizontal row of article-level actions, under the date/reading-time line
 * and above the authors: "Copy as Markdown", "View raw", "Follow <topic>".
 *
 * It exists because there was no such row — `CopyAsMarkdown` rendered its own
 * inline-flex wrapper and the header dropped it in as-is, which worked right up
 * until a second action needed a place to live. Owning the row here keeps the
 * spacing in one file and stops each action from inventing its own.
 *
 * These belong together as one family: they are all "take this with you /
 * keep up with this", as opposed to the end-of-article blocks (reactions, typo
 * report, Bluesky) which are about giving something back.
 */
export default function ArticleActions({ metadata }: Props): JSX.Element {
  const mainTag = metadata.frontMatter?.mainTag;

  // The most specific feed this reader could want: the post's own main topic,
  // falling back to the site-wide feed when the post declares no mainTag.
  // `plugins/blog-feed-plugin` writes one feed per tag under the same slug
  // `createSlug()` produces here, so this URL always has a file behind it.
  const feedUrl = mainTag ? `/blog/tags/${createSlug(mainTag)}/rss.xml` : "/blog/rss.xml";
  const label = mainTag ? getTagLabel(mainTag) : "this blog";

  return (
    <div className={styles.actions}>
      <CopyAsMarkdown metadata={metadata} />
      <FollowFeed feedUrl={feedUrl} label={label} variant="inline" />
    </div>
  );
}
