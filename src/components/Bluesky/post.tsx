import Icon from "./bluesky.svg";
import styles from "./styles.module.css";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import type { BlueskyMetadata, BlueskySiteConfig } from "./useBlueskyEngagement";

interface Props {
  metadata: BlueskyMetadata;
}

export default function BlueskyPost({ metadata }: Props) {
  const { siteConfig } = useDocusaurusContext();
  const blueSkyConfig = siteConfig?.customFields?.bluesky as
    BlueskySiteConfig | undefined;
  const blueskyRecordKey = metadata?.frontMatter?.blueskyRecordKey;

  if (!blueSkyConfig?.handle || !blueskyRecordKey) {
    return null;
  }

  const postUrl = `https://bsky.app/profile/${blueSkyConfig.handle}/post/${blueskyRecordKey}`;

  return (
    <a
      href={postUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.blueskyButton}
      aria-label="See the post on Bluesky"
    >
      {/* alt dropped: SVGProps has no such prop — was a no-op DOM attribute even before this
          migration, and the link's own aria-label already names the icon. */}
      <Icon className={styles.blueskyLogo} />
      Like, share or comment on Bluesky
    </a>
  );
}
