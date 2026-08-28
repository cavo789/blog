import type { JSX } from "react";
import TreeItem from "../utils/TreeItem";

interface Props {
  /** Icon name (LogoIcon) to display */
  icon?: string;
  /** Icon size in pixels */
  iconSize?: number;
  /** Optional badge to display */
  badge?: string;
  /** File name to display */
  label: string;
  /** Nesting level (managed automatically) */
  level?: number;
}

/**
 * File Component - Represents a file in the tree structure
 */
export default function File({
  icon,
  iconSize = 20,
  badge,
  label,
  level = 0,
}: Props): JSX.Element {
  return (
    <TreeItem
      icon={icon}
      iconSize={iconSize}
      badge={badge}
      label={label}
      expanded={false}
      level={level}
      defaultEmoji="📄"
    />
  );
}
