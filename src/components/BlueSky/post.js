/**
 * 🔗 BlueSkyPost Component
 *
 * Renders a button that links directly to the associated BlueSky post,
 * allowing users to like, share, or comment on it via the BlueSky platform.
 *
 * 🧠 Behavior:
 * - If either `blueSkyRecordKey` (from frontmatter) or the author's BlueSky handle
 *   (from `docusaurus.config.js`) is missing, the component returns `null`.
 * - If both are present, it constructs a valid post URL and renders a styled button
 *   with the BlueSky icon and accessible label.
 *
 * 🧾 Frontmatter Requirement:
 * ---
 * title: "My Post"
 * blueSkyRecordKey: 3lun2qjuxc22r
 * ---
 *
 * ⚙️ Configuration:
 * Ensure your BlueSky handle is defined in `docusaurus.config.js`:
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
 * @param {string} [props.metadata.frontMatter.blueSkyRecordKey] - Unique key identifying the BlueSky post
 *
 * 🎨 Styling:
 * - Uses `styles.blueSkyButton` for layout and hover effects
 * - Includes `bluesky.svg` icon with `styles.blueSkyLogo`
 * - Accessible via `aria-label` for screen readers
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
