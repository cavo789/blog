/**
 * 📤 BlueSkyShare Component
 *
 * Renders a button that allows users to share the current Docusaurus document on their own BlueSky profile.
 * This component is only displayed when the document does **not** have a `blueSkyRecordKey` in its YAML frontmatter,
 * meaning no official BlueSky post exists yet.
 *
 * 🔀 Behavior:
 * - If `blueSkyRecordKey` is **absent**:
 *   → Renders a share button linking to BlueSky's compose intent with the document title and permalink.
 * - If `blueSkyRecordKey` is **present**:
 *   → The component returns `null` and is replaced by `<BlueSkyPost>`, which enables full post interaction.
 *
 * 🧾 Frontmatter Example (no post yet):
 * ---
 * title: "My Post"
 * ---
 *
 * ⚙️ Configuration:
 * Ensure your site’s base URL is defined in `docusaurus.config.js` under `siteConfig.url`.
 * This is used to generate the full permalink for sharing.
 *
 * 📦 Props:
 * @param {object} props
 * @param {object} props.metadata - Docusaurus document metadata
 * @param {string} props.metadata.title - Title of the document
 * @param {string} props.metadata.permalink - Full permalink of the document
 * @param {object} [props.metadata.frontMatter] - Frontmatter object
 * @param {string} [props.metadata.frontMatter.blueSkyRecordKey] - Optional key for an existing BlueSky post
 *
 * 🎨 Styling:
 * - Uses `styles.blueSkyButton` for layout and hover effects
 * - Includes `bluesky.svg` icon with `styles.blueSkyLogo`
 * - Accessible via `aria-label` for screen readers
 */

import Icon from "./bluesky.svg";
import PropTypes from "prop-types";
import styles from './styles.module.css';
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

export default function BlueSkyShare({ metadata}) {
  const blueSkyRecordKey = metadata?.frontMatter?.blueSkyRecordKey;

  if (blueSkyRecordKey) return;

  const { siteConfig } = useDocusaurusContext();

  if (!metadata.title || !metadata.permalink) {
    console.debug("<BlueSkyShare> Missing required properties", { metadata });
    return null;
  }

  const shareLink =
    `https://bsky.app/intent/compose?text=` +
    `${encodeURIComponent(metadata.title)}%20${siteConfig.url}${encodeURIComponent(
      metadata.permalink
    )}`;

  return (
    <a href={shareLink} target="_blank" rel="noopener noreferrer" className={styles.blueSkyButton} aria-label="Share this post on BlueSky">
      <Icon alt="Bluesky Icon" className={styles.blueSkyLogo} />
      Share on BlueSky
    </a>
  );
}

BlueSkyShare.propTypes = {
  metadata: PropTypes.shape({
    title: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    frontMatter: PropTypes.shape({
      blueSkyRecordKey: PropTypes.string // Optional. If present this component will not display anything
    })
  }).isRequired
};
