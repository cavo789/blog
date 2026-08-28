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
 */

import type { JSX } from "react";
import styles from "./styles.module.css";
import useBaseUrl from "@docusaurus/useBaseUrl";

interface Props {
  /** Path to the image (e.g. `/img/example.png`), or a `require()`d asset */
  src: string | { default: string };
  /** Tooltip text shown on hover */
  title?: string;
  /** Alternative text for accessibility (if missing, reuse the Title property) */
  alt?: string;
}

export default function Image({ src, alt, title }: Props): JSX.Element {
  const isAbsolutePath = typeof src === "string" && src.startsWith("/");
  const resolvedUrl = useBaseUrl(isAbsolutePath ? src : undefined);
  const imgSrc = (isAbsolutePath ? resolvedUrl : src) as string;

  return (
    <div className={styles.container}>
      <img src={imgSrc} alt={alt || title} title={title} loading="lazy" />
    </div>
  );
}
