/**
 * Renders a button to show the post on Bluesky (and be able to like/share/comment)
 *
 * This button will displayed only when the post has, in his YAML frontmatter, the 
 * blueSkyRecordKey entry i.e. the hash of the BlueSky post.
 * 
 * See comments in BlueSky.js component for the list of requirements
 *
 * @param {Object} props
 * @param {string} props.recordKey - Unique record from the frontmatter
 */

import clsx from "clsx";
import PropTypes from "prop-types";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

export default function BlueSkyPost({ recordKey }) {
  const { siteConfig } = useDocusaurusContext();
  const blueSkyConfig = siteConfig?.customFields?.blueSky;

  if (!blueSkyConfig?.handle || !recordKey) {
    console.warn(
      "<BlueSkyPost> Missing required BlueSky handle or properties",
      {
        recordKey,
        blueSkyConfig,
      }
    );

    return null;
  }

  const postUrl = `https://bsky.app/profile/${blueSkyConfig.handle}/post/${recordKey}`;

  return (
    <a
      href={postUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={clsx("blueSkyButton", "button")}
      aria-label="See the post on BlueSky"
    >
      <img src="/img/bluesky.svg" alt="Bluesky Icon" width="20" height="20" />
      Like or comment on BlueSky
    </a>
  );
}

BlueSkyPost.propTypes = {
  recordKey: PropTypes.string.isRequired,
};
