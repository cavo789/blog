import { useMemo, type JSX, type ReactNode } from "react";
import Head from "@docusaurus/Head";
import MobileQuickLinks from "@site/src/components/Blog/MobileQuickLinks";
import styles from "./styles.module.css";

// Recursively extracts plain text from React nodes for JSON-LD abstract
function extractText(node: unknown): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (node && typeof node === "object") {
    const children = (node as { props?: { children?: unknown } }).props?.children;
    if (children) return extractText(children);
  }
  return "";
}

interface Props {
  children: ReactNode;
}

// Injects JSON-LD so search engines read the abstract via Schema.org BlogPosting
export default function TLDR({ children }: Props): JSX.Element {
  const structuredData = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      abstract: extractText(children),
    }),
    [children],
  );

  return (
    <>
      <Head>
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
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

      {/*
        The TL;DR is the one block every post opens with, which makes it the only reliable
        anchor for a "read next" hint placed *after* the reader has confirmed the article is
        the right one. MobileQuickLinks decides on its own whether it has anything to show.
      */}
      <MobileQuickLinks />
    </>
  );
}
