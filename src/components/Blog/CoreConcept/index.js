import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.css';
import { FaLightbulb } from 'react-icons/fa';

/**
 * CoreConcept component
 *
 * Renders a styled informational box with a lightbulb icon,
 * a customizable title, and any child content passed to it.
 *
 * @component
 * @example
 * return (
 *   <CoreConcept title="React Hooks">
 *     <p>Hooks let you use state and other features without writing a class.</p>
 *   </CoreConcept>
 * )
 *
 * @param {Object} props - Component props
 * @param {string} [props.title='Core Concept'] - Title displayed in the header
 * @param {React.ReactNode} props.children - Content to be rendered inside the box
 * @returns {JSX.Element} Rendered CoreConcept component
 */
export default function CoreConcept({ title = 'Core Concept', children }) {
  return (
    <div className={styles.coreConcept}>
      <div className={styles.header}>
        <FaLightbulb className={styles.icon} />
        <h4>{title}</h4>
      </div>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
}

CoreConcept.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
};
