import React from "react";

interface PanelToggleIconProps {
  className?: string;
}

/**
 * A static "toggle side panel" glyph (a box with a left divider), not a chevron. A chevron has to
 * point the right way for each of the two states it represents (collapse vs. expand) and gets
 * that backwards easily; this glyph means "toggle the panel" either way, so there's no direction
 * to get wrong. Matches the sidebar-toggle icon convention used by claude.ai, VS Code, etc.
 */
export default function PanelToggleIcon({ className }: PanelToggleIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="9" y1="3" x2="9" y2="21" />
    </svg>
  );
}
