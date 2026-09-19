/**
 * @component Details
 * @description
 * A lightweight wrapper around the native <details> and <summary> HTML elements,
 * styled with custom CSS and enhanced with React props.
 *
 * This component displays a collapsible section with a summary label and expandable content.
 * Useful for FAQs, accordions, or any UI that benefits from progressive disclosure.
 *
 * @example
 * <Details label="More Info">
 *   <p>This is the hidden content that appears when expanded.</p>
 * </Details>
 */

import type { JSX, ReactNode } from "react";
import styles from "./styles.module.css";

interface Props {
  /** The label */
  label: ReactNode;
  /** Content to render inside the hero container */
  children: ReactNode;
  /** Optional extra class for the <summary>, for a caller that needs its own label styling
   *  (e.g. SeriesPosts's eyebrow intro line) without affecting every other Details usage. */
  summaryClassName?: string;
}

export default function Details({
  label,
  children,
  summaryClassName,
}: Props): JSX.Element {
  return (
    <details className={styles.details}>
      <summary className={summaryClassName}>{label}</summary>
      <div className={styles.content}>{children}</div>
    </details>
  );
}
