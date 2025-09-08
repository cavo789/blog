/**
 * 🔗 BlueskyPost Component
 *
 * Renders a button that links directly to the associated Bluesky post,
 * allowing users to like, share, or comment on it via the Bluesky platform.
 *
 * 🧠 Behavior:
 * - If either `blueskyRecordKey` (from frontmatter) or the author's Bluesky handle
 *   (from `docusaurus.config.js`) is missing, the component returns `null`.
 * - If both are present, it constructs a valid post URL and renders a styled button
 *   with the Bluesky icon and accessible label.
 *
 * 🧾 Frontmatter Requirement:
 * ---
 * title: "My Post"
 * blueskyRecordKey: 3lun2qjuxc22r
 * ---
 *
 * ⚙️ Configuration:
 * Ensure your Bluesky handle is defined in `docusaurus.config.js`:
 *
 * ```js
 * const config = {
 *   customFields: {
 *     blueSky: {
 *       handle: 'your-handle.bsky.social',
 *     },
 *   },
 * };
 * ```
 *
 * 📦 Props:
 * @param {object} props
 * @param {object} props.metadata - Docusaurus document metadata
 * @param {object} [props.metadata.frontMatter] - Frontmatter object
 * @param {string} [props.metadata.frontMatter.blueskyRecordKey] - Unique key identifying the Bluesky post
 *
 * 🎨 Styling:
 * - Uses `styles.blueskyButton` for layout and hover effects
 * - Includes `bluesky.svg` icon with `styles.blueskyLogo`
 * - Accessible via `aria-label` for screen readers
 */

import Icon from "./bluesky.svg";
import PropTypes from "prop-types";
import styles from "./styles.module.css";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

export default function BlueskyPost({ metadata }) {
  const { siteConfig } = useDocusaurusContext();
  const blueSkyConfig = siteConfig?.customFields?.bluesky;
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
      <Icon alt="Bluesky Icon" className={styles.blueskyLogo} />
      Like, share or comment on Bluesky
    </a>
  );
}

BlueskyPost.propTypes = {
  metadata: PropTypes.shape({
    frontMatter: PropTypes.shape({
      blueskyRecordKey: PropTypes.string, // Optional
    }),
  }).isRequired,
};
