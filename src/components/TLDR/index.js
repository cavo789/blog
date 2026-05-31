import { useMemo } from "react";
import Head from "@docusaurus/Head";
import styles from "./styles.module.css";

// Recursively extracts plain text from React nodes for JSON-LD abstract
function extractText(node) {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (node && typeof node === "object" && node.props?.children) {
    return extractText(node.props.children);
  }
  return "";
}

// Injects JSON-LD so search engines read the abstract via Schema.org BlogPosting
export default function TLDR({ children }) {
  const structuredData = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      abstract: extractText(children),
    }),
    [children]
  );

  return (
    <>
      <Head>
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Head>

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
