import type { JSX } from "react";
import Link from "@docusaurus/Link";
import styles from "./styles.module.css";

interface QuickJumpLink {
  /** Text shown for the link */
  label: string;
  /** In-page anchor (e.g. "#all-files-at-a-glance") or any URL Docusaurus's Link accepts */
  to: string;
}

interface Props {
  links: QuickJumpLink[];
  /** Label prefix, e.g. "Quick Jump" */
  title?: string;
}

// A compact strip of in-page anchor links, meant to sit right after the
// <!-- truncate --> line so a reader can jump straight to the section they need
// (e.g. "All Files at a Glance" on an article using ProjectSetup) without scrolling.
//
// The trailing ":" after the title is gone: the label is rendered as an eyebrow
// (uppercase, letter-spaced), and a colon inside letter-spaced small caps
// detaches from its word and reads as a stray mark. The flex gap already
// separates label from links. <strong> became <span> for the same reason —
// the eyebrow already carries weight 700, and this is a label, not emphasis.
export default function QuickJump({
  links,
  title = "Quick Jump",
}: Props): JSX.Element | null {
  if (!links || links.length === 0) return null;

  return (
    <nav className={styles.quickJump} aria-label={title}>
      <span className={styles.title}>{title}</span>
      <ul className={styles.list}>
        {links.map((link) => (
          <li key={link.to} className={styles.item}>
            <Link to={link.to}>{link.label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
