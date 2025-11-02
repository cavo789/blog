import React from "react";
import PropTypes from "prop-types";
import TreeItem from "../utils/TreeItem";

/**
 * Folder Component - Represents a folder in the tree structure
 */
export default function Folder({ icon, iconSize = 24, badge, label, expanded = false, children, level = 0 }) {
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

Folder.propTypes = {
  /** Icon name (LogoIcon) to display */
  icon: PropTypes.string,
  /** Icon size in pixels */
  iconSize: PropTypes.number,
  /** Optional badge to display */
  badge: PropTypes.string,
  /** Folder name to display */
  label: PropTypes.string.isRequired,
  /** Initial state: expanded (true) or collapsed (false) */
  expanded: PropTypes.bool,
  /** Folder content (sub-folders and files) */
  children: PropTypes.node,
  /** Nesting level (managed automatically) */
  level: PropTypes.number,
};