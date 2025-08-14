/**
 * Renders a button to show the post on Bluesky (and be able to like/share/comment)
 *
 * This info will displayed only when the post has, in his YAML frontmatter, the
 * `blueSkyRecordKey` entry i.e. the hash of the BlueSky post.
 *
 * See comments in BlueSky.js component for the list of requirements
 *
 * @param {object} props
 * @param {object} props.metadata - The Docusaurus document metadata, including the frontmatter.
 * @param {object} [props.metadata.frontMatter] - The frontmatter object.
 * @param {string} [props.metadata.frontMatter.blueSkyRecordKey] - The unique key of the
 * corresponding BlueSky post. Its presence determines the component's behavior.
 */

import Icon from "./bluesky.svg";
import PropTypes from "prop-types";
import styles from "./styles.module.css";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

export default function BlueSkyPost({ metadata }) {
  const { siteConfig } = useDocusaurusContext();
  const blueSkyConfig = siteConfig?.customFields?.blueSky;
  const blueSkyRecordKey = metadata?.frontMatter?.blueSkyRecordKey;

  if (!blueSkyConfig?.handle || !blueSkyRecordKey) {
    return null;
  }

  const postUrl = `https://bsky.app/profile/${blueSkyConfig.handle}/post/${blueSkyRecordKey}`;

  return (
    <a
      href={postUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.blueSkyButton}
      aria-label="See the post on BlueSky"
    >
      <Icon alt="Bluesky Icon" className={styles.blueSkyLogo} />
      Like, share or comment on BlueSky
    </a>
  );
}

BlueSkyPost.propTypes = {
  metadata: PropTypes.shape({
    frontMatter: PropTypes.shape({
      blueSkyRecordKey: PropTypes.string, // Optional
    }),
  }).isRequired,
};
