/**
 * 🖼️ Image Component
 *
 * A lightweight wrapper for rendering images in Docusaurus with base URL resolution.
 * Ensures that image paths are correctly resolved relative to the site's base URL,
 * making it ideal for static assets stored in the `static/img` directory.
 *
 * 🔍 Behavior:
 * - Uses `useBaseUrl()` to resolve the image path
 * - Applies scoped styling via CSS modules
 * - Supports optional `alt` and `title` attributes for accessibility and tooltips
 * - Enables lazy loading for performance optimization
 *
 * 📦 Props:
 * @param {object} props
 * @param {string} props.src - Path to the image (e.g. `/img/example.png` or `./images/example.png`)
 * @param {string} [props.title] - Tooltip text shown on hover
 * @param {string} [props.alt] - Alternative text for accessibility (if missing, reuse the Title property)
 */

import PropTypes from "prop-types";
import styles from "./styles.module.css";
import useBaseUrl from "@docusaurus/useBaseUrl";
export default function Image({ src, alt, title }) {
  const imgSrc =
    typeof src === "string" && src.startsWith("/")
      ? useBaseUrl(src)
      : src;

  return (
    <div className={styles.container}>
      <img src={imgSrc} alt={alt || title} title={title} loading="lazy" />
    </div>
  );
}

Image.propTypes = {
  src: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  alt: PropTypes.string,
  title: PropTypes.string,
};
