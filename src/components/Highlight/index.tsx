/**
 * Highlight Component
 *
 * A simple React component used to emphasize inline content with a custom background color.
 * Typically used in blog posts or documentation pages within a Docusaurus site.
 *
 * Example usage:
 * <Highlight color="#ff4081">Important note</Highlight>
 */

import type { JSX, ReactNode } from "react";

interface Props {
  children: ReactNode;
  color: string;
}

export default function Highlight({ children, color }: Props): JSX.Element {
  return (
    <span
      style={{
        backgroundColor: color,
        borderRadius: "2px",
        color: "#fff",
        padding: "0.2rem",
      }}
    >
      {children}
    </span>
  );
}
