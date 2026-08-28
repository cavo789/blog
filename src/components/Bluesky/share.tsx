import Icon from "./bluesky.svg";
import styles from "./styles.module.css";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

// Declared locally rather than imported from useBlueskyEngagement — this file (built in the
// series' first article) stands on its own before that hook exists in the tutorial's timeline.
interface Props {
  metadata: {
    title?: string;
    permalink?: string;
    frontMatter?: {
      blueskyRecordKey?: string;
    };
  };
}

export default function BlueskyShare({ metadata }: Props) {
  const { siteConfig } = useDocusaurusContext();
  const blueskyRecordKey = metadata?.frontMatter?.blueskyRecordKey;

  if (blueskyRecordKey) return null;

  if (!metadata.title || !metadata.permalink) {
    console.debug("<BlueskyShare> Missing required properties", { metadata });
    return null;
  }

  const shareLink =
    `https://bsky.app/intent/compose?text=` +
    `${encodeURIComponent(metadata.title)}%20${siteConfig.url}${encodeURIComponent(
      metadata.permalink,
    )}`;

  return (
    <a
      href={shareLink}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.blueskyButton}
      aria-label="Share this post on Bluesky"
    >
      {/* alt dropped: SVGProps has no such prop — was a no-op DOM attribute even before this
          migration, and the link's own aria-label already names the icon. */}
      <Icon className={styles.blueskyLogo} />
      Share on Bluesky
    </a>
  );
}
