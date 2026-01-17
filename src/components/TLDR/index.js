import React from "react";
import styles from "./styles.module.css";

/**
 * TLDR Component
 *
 * Displays a summary block using Docusaurus native styles (Infima).
 * It supports both Dark and Light modes automatically via the 'alert--info' class.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - The content to display inside the block
 */
export default function TLDR({ children }) {
  return (
    <div
      className={`alert alert--info margin-bottom--md ${styles.tldrContainer}`}
    >
      <div className={styles.tldrHeader}>
        <span role="img" aria-label="lightning" className={styles.tldrIcon}>
          ⚡
        </span>
        <strong className={styles.tldrTitle}>TL;DR</strong>
      </div>

      <div className={styles.tldrContent}>{children}</div>
    </div>
  );
}
