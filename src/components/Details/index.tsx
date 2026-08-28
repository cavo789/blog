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
import "./styles.module.css";

interface Props {
  /** The label */
  label: ReactNode;
  /** Content to render inside the hero container */
  children: ReactNode;
}

export default function Details({ label, children }: Props): JSX.Element {
  return (
    <details className={`alert alert--info`}>
      <summary>{label}</summary>
      <div className="content">{children}</div>
    </details>
  );
}
