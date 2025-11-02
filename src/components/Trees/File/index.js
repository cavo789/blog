import React from "react";
import PropTypes from "prop-types";
import TreeItem from "../utils/TreeItem";

/**
 * File Component - Represents a file in the tree structure
 */
export default function File({ icon, iconSize = 20, badge, label, level = 0 }) {
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

File.propTypes = {
  /** Icon name (LogoIcon) to display */
  icon: PropTypes.string,
  /** Icon size in pixels */
  iconSize: PropTypes.number,
  /** Optional badge to display */
  badge: PropTypes.string,
  /** File name to display */
  label: PropTypes.string.isRequired,
  /** Nesting level (managed automatically) */
  level: PropTypes.number,
};