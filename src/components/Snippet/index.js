/**
 * 📄 Snippet Component
 *
 * A collapsible content block designed for displaying code snippets, notes, or any inline content
 * with a toggleable interface. Ideal for documentation, tutorials, or expandable UI sections.
 *
 * 🔍 Behavior:
 * - Displays a filename label and a toggle button
 * - Expands or collapses the content area with smooth height transitions
 * - Uses `defaultOpen` prop to control initial visibility
 * - Generates a unique `aria-controls` ID for accessibility
 *
 * 🧾 Props:
 * @param {object} props
 * @param {string} props.filename - Label displayed on the toggle button (e.g. filename or section title)
 * @param {ReactNode} props.children - Content to be revealed inside the collapsible block
 * @param {boolean} [props.defaultOpen=true] - Whether the snippet is open by default
 *
 * 🎨 Styling:
 * - Uses `styles.snippet_block` for container layout
 * - Chevron icon rotates on toggle via `styles.rotate`
 * - Smooth height animation via inline `maxHeight` style
 *
 * 🛠️ Accessibility:
 * - Button includes `aria-expanded` and `aria-controls` for screen reader support
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import styles from "./styles.module.css";

export default function Snippet({ filename, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  const contentRef = useRef(null);
  const [height, setHeight] = useState("0px");

  useEffect(() => {
  if (contentRef.current) {
    setHeight(open ? `${contentRef.current.scrollHeight}px` : "0px");
  }
}, [open, children]);

  const handleToggle = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  const contentId = useRef(
    `snippet-content-${Math.random().toString(36).substr(2, 9)}`
  ).current;

  return (
    <div className={`${styles.snippet_block} alert alert--info`}>
      <button className={styles.snippet_summary} onClick={handleToggle} aria-expanded={open} aria-controls={contentId}>
        <span className="">{filename}</span>
        <span className={`${styles.chevron} ${open ? styles.rotate : ""}`}>&#9662;</span>
      </button>
      <div ref={contentRef} id={contentId} className={styles.snippet_content} style={{ maxHeight: height }} >
        <div className={styles.snippet_inner}>{children}</div>
      </div>
    </div>
  );
}
