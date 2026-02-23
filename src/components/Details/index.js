/**
 * @component Details
 * @description
 * A lightweight wrapper around the native <details> and <summary> HTML elements,
 * styled with custom CSS and enhanced with React props.
 *
 * This component displays a collapsible section with a summary label and expandable content.
 * Useful for FAQs, accordions, or any UI that benefits from progressive disclosure.
 *
 * @example
 * <Details label="More Info">
 *   <p>This is the hidden content that appears when expanded.</p>
 * </Details>
 */

import PropTypes from "prop-types"
import './styles.module.css';

export default function Details({ label, children }) {
  return (
    <details className={`alert alert--info`}>
        <summary>{ label }</summary>
        <div class="content">
          {children}
        </div>
    </details>
  );
}

Details.propTypes = {
  /** The label */
  label: PropTypes.node.isRequired,

  /** Content to render inside the hero container */
  children: PropTypes.node.isRequired,
};
