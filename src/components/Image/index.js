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
 * @param {string} props.img - Relative path to the image (e.g. `/img/example.png`)
 * @param {string} [props.alt] - Alternative text for accessibility
 * @param {string} [props.title] - Tooltip text shown on hover
 */

import PropTypes from "prop-types";
import styles from "./styles.module.css";
import useBaseUrl from "@docusaurus/useBaseUrl";

export default function Image({ img, alt, title }) {
  return (
    <div className={styles.container}>
      <img src={useBaseUrl(img)} alt={alt} title={title} lazy="loading" />
    </div>
  );
}

Image.propTypes = {
  img: PropTypes.string.isRequired,
  alt: PropTypes.string,
  title: PropTypes.string,
};
