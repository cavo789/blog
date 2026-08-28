/**
 * 🦸‍♂️ Hero Component
 *
 * A reusable layout wrapper for prominent page sections.
 * Typically used to introduce content with a bold visual style.
 *
 * Behavior:
 * - Applies primary hero styling with margin and container layout
 * - Wraps children in a styled div for consistent presentation
 *
 * Styling:
 * - Uses `styles.hero` from CSS module
 * - Combines with Docusaurus utility classes: `hero--primary`, `margin-bottom--lg`
 */

import type { JSX, ReactNode } from "react";
import styles from "./styles.module.css";

interface Props {
  /** Content to render inside the hero container */
  children: ReactNode;
  /** Optional custom className for additional styling */
  className?: string;
}

export default function Hero({ children, className }: Props): JSX.Element {
  return (
    <div className={`${styles.hero} hero--primary margin-bottom--lg ${className || ""}`}>
      <div className="container">{children}</div>
    </div>
  );
}
