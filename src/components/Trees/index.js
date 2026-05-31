import React, { Children, isValidElement } from "react";
import PropTypes from "prop-types";
import styles from "./styles.module.css";

/**
 * Trees Component - Main component to display a tree structure
 * Uses intuitive JSX syntax with nested tags
 */
export default function Trees({ title, children }) {
  return (
    <div className={styles.treeContainer}>
      {title && <h3 className={styles.treeTitle}>{title}</h3>}
      <div className={styles.treeContent}>
        {Children.map(children, (child, index) => {
          if (isValidElement(child)) {
            return React.cloneElement(child, {
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

Trees.propTypes = {
  /** Optional tree title */
  title: PropTypes.string,
  /** Tree content (Folder and File components) */
  children: PropTypes.node.isRequired,
};
