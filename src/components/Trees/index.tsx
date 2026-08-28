import React, { Children, isValidElement, type JSX, type ReactNode } from "react";
import styles from "./styles.module.css";

interface Props {
  /** Optional tree title */
  title?: string;
  /** Tree content (Folder and File components) */
  children: ReactNode;
}

/**
 * Trees Component - Main component to display a tree structure
 * Uses intuitive JSX syntax with nested tags
 */
export default function Trees({ title, children }: Props): JSX.Element {
  return (
    <div className={styles.treeContainer}>
      {title && <h3 className={styles.treeTitle}>{title}</h3>}
      <div className={styles.treeContent}>
        {Children.map(children, (child, index) => {
          if (isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<{ level?: number }>, {
              key: index,
              level: 0,
            });
          }
          return null;
        })}
      </div>
    </div>
  );
}
