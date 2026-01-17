import React from "react";
import Head from "@docusaurus/Head";
import styles from "./styles.module.css";

/**
 * TLDR Component
 *
 * Displays a summary block using Docusaurus native styles (Infima).
 * It supports both Dark and Light modes automatically via the 'alert--info' class.
 *
 * It also injects structured data (JSON-LD) to define this content as
 * the "abstract" of the blog post for search engines (Schema.org).
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - The content to display inside the block
 */
export default function TLDR({ children }) {
  // Ensure the content is treated as a string for the JSON-LD schema
  const summaryText =
    typeof children === "string" ? children : String(children);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    abstract: summaryText,
  };

  return (
    <>
      {/* 1. Invisible SEO Layer: JSON-LD Injection */}
      <Head>
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Head>

      {/* 2. Visible UI Layer */}
      <div
        className={`alert alert--info margin-bottom--md ${styles.tldrContainer}`}
        role="region"
        aria-label="Article Summary"
      >
        <div className={styles.tldrHeader}>
          <span role="img" aria-label="lightning" className={styles.tldrIcon}>
            ⚡
          </span>
          <strong className={styles.tldrTitle}>TL;DR</strong>
        </div>

        <div className={styles.tldrContent}>{children}</div>
      </div>
    </>
  );
}
