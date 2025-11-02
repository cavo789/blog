import React, { useState, Children, isValidElement } from "react";
import styles from "../styles.module.css";
import LogoIcon from '@site/src/components/Blog/LogoIcon';

/**
 * TreeItem Component - Represents an individual tree element
 * Internal component shared by Folder and File
 */
export default function TreeItem({ icon, iconSize = 24, badge, label, expanded = false, children, level = 0, defaultEmoji }) {
  const [isExpanded, setIsExpanded] = useState(expanded);

  // Filter valid React children (other Folder or File)
  const childElements = Children.toArray(children).filter(child => isValidElement(child));
  const hasChildren = childElements.length > 0;

  const toggleExpand = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className={styles.treeNode}>
      <div
        className={`${styles.nodeContent} ${hasChildren ? styles.hasChildren : ""}`}
        style={{ paddingLeft: `${level * 20}px` }}
        onClick={toggleExpand}
      >
        {/* Expand/collapse icon */}
        {hasChildren && (
          <span className={styles.expandIcon}>
            {isExpanded ? "▼" : "▶"}
          </span>
        )}

        {/* Node icon with label (via LogoIcon or native emoji) */}
        {icon ? (
          <span className={styles.nodeIcon}>
            <LogoIcon name={icon} size={iconSize} />
            <span className={styles.nodeLabel}>{label}</span>
          </span>
        ) : defaultEmoji ? (
          <span className={styles.nodeIcon}>
            <span style={{ fontSize: `${iconSize}px`, lineHeight: 1 }}>{defaultEmoji}</span>
            <span className={styles.nodeLabel}>{label}</span>
          </span>
        ) : (
          <span className={styles.nodeLabel}>{label}</span>
        )}

        {/* Optional badge */}
        {badge && (
          <span className={styles.nodeBadge}>{badge}</span>
        )}
      </div>

      {/* Children (recursive) */}
      {hasChildren && isExpanded && (
        <div className={styles.nodeChildren}>
          {childElements.map((child, index) =>
            React.cloneElement(child, {
              key: index,
              level: level + 1,
            })
          )}
        </div>
      )}
    </div>
  );
}