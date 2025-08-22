/**
 * 🦸‍♂️ Hero Component
 *
 * A reusable layout wrapper for prominent page sections.
 * Typically used to introduce content with a bold visual style.
 *
 * Props:
 * - children (ReactNode): Content to be rendered inside the hero container
 * - className (string): Optional additional class names for styling
 *
 * Behavior:
 * - Applies primary hero styling with margin and container layout
 * - Wraps children in a styled div for consistent presentation
 *
 * Styling:
 * - Uses `styles.hero` from CSS module
 * - Combines with Docusaurus utility classes: `hero--primary`, `margin-bottom--lg`
 *
 * Returns:
 * - A visually distinct section for page intros or highlights
 */

import PropTypes from "prop-types"
import styles from './styles.module.css';

export default function Hero({ children, className }) {
  return (
    <div className={`${styles.hero} hero--primary margin-bottom--lg`}>
      <div className="container">
        {children}
      </div>
    </div>
  );
}

Hero.propTypes = {
  /** Content to render inside the hero container */
  children: PropTypes.node.isRequired,

  /** Optional custom className for additional styling */
  className: PropTypes.string
};
