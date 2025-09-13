/**
 * Highlight Component
 *
 * A simple React component used to emphasize inline content with a custom background color.
 * Typically used in blog posts or documentation pages within a Docusaurus site.
 *
 * Props:
 * - children (ReactNode): The content to be highlighted.
 * - color (string): The background color to apply to the highlight.
 *
 * Example usage:
 * <Highlight color="#ff4081">Important note</Highlight>
 */

import PropTypes from 'prop-types';

export default function Highlight({children, color}) {
  return (
    <span
      style={{
        backgroundColor: color,
        borderRadius: '2px',
        color: '#fff',
        padding: '0.2rem',
      }}>
      {children}
    </span>
  );
}

Highlight.propTypes = {
  children: PropTypes.node.isRequired,
  color: PropTypes.string.isRequired,
};