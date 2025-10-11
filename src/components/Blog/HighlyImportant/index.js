import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.css';
import { FaExclamationTriangle } from 'react-icons/fa';

/**
 * HighlyImportant component
 *
 * Displays a visually styled alert box with an exclamation icon,
 * a customizable title, and any child content passed to it.
 *
 * @component
 * @example
 * return (
 *   <HighlyImportant title="Warning!">
 *     <p>This action cannot be undone.</p>
 *   </HighlyImportant>
 * )
 *
 * @param {Object} props - Component props
 * @param {string} [props.title='Highly Important'] - Title displayed in the header
 * @param {React.ReactNode} props.children - Content to be rendered inside the alert box
 * @returns {JSX.Element} Rendered HighlyImportant component
 */
export default function HighlyImportant({ title = 'Highly Important', children }) {
  return (
    <div className={styles.highlyImportant}>
      <div className={styles.header}>
        <FaExclamationTriangle className={styles.icon} />
        <h4>{title}</h4>
      </div>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
}

HighlyImportant.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
};
