import Icon from "./bluesky.svg";
import PropTypes from "prop-types";
import styles from "./styles.module.css";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

export default function BlueskyShare({ metadata }) {
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
      metadata.permalink
    )}`;

  return (
    <a href={shareLink} target="_blank" rel="noopener noreferrer" className={styles.blueskyButton} aria-label="Share this post on Bluesky">
      <Icon alt="Bluesky Icon" className={styles.blueskyLogo} />
      Share on Bluesky
    </a>
  );
}

BlueskyShare.propTypes = {
  metadata: PropTypes.shape({
    title: PropTypes.string.isRequired,
    permalink: PropTypes.string.isRequired,
    frontMatter: PropTypes.shape({
      blueskyRecordKey: PropTypes.string,
    }),
  }).isRequired,
};
