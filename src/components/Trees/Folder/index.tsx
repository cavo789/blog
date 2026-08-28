import type { JSX, ReactNode } from "react";
import TreeItem from "../utils/TreeItem";

interface Props {
  /** Icon name (LogoIcon) to display */
  icon?: string;
  /** Icon size in pixels */
  iconSize?: number;
  /** Optional badge to display */
  badge?: string;
  /** Folder name to display */
  label: string;
  /** Initial state: expanded (true) or collapsed (false) */
  expanded?: boolean;
  /** Folder content (sub-folders and files) */
  children?: ReactNode;
  /** Nesting level (managed automatically) */
  level?: number;
}

/**
 * Folder Component - Represents a folder in the tree structure
 */
export default function Folder({
  icon,
  iconSize = 24,
  badge,
  label,
  expanded = false,
  children,
  level = 0,
}: Props): JSX.Element {
  return (
    <TreeItem
      icon={icon}
      iconSize={iconSize}
      badge={badge}
      label={label}
      expanded={expanded}
      level={level}
      defaultEmoji="📁"
    >
      {children}
    </TreeItem>
  );
}
