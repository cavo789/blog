/**
 * Terminal Component
 *
 * A stylized terminal emulator UI component for Docusaurus pages.
 * Displays a Linux-style header with a customizable title and a code block
 * for terminal output or commands.
 *
 * Features:
 * - Customizable terminal title (defaults to "christophe@home: ~")
 * - Terminal icon and control dots for visual realism
 * - Styled code block for terminal content
 * - Theme-friendly layout using CSS modules
 *
 * Props:
 * @param {React.ReactNode} children - Terminal content to display inside the code block.
 * @param {string} [title] - Optional terminal title displayed in the header.
 *
 * Example usage:
 * <Terminal title="user@machine: ~/project">
 *   npm install
 *   npm run build
 * </Terminal>
 */

import PropTypes from "prop-types";
import styles from "./styles.module.css";
import clsx from "clsx";
import Icon from "./icon.svg"; // your SVG

function getText(children) {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(getText).join("");
  if (typeof children === "object" && children.props?.children)
    return getText(children.props.children);
  return "";
}

export default function Terminal({ children, title }) {
  const displayTitle = title || "christophe@machine: ~";
  const content = getText(children);
  const lines = content.split("\n");

  return (
    <div className={styles.terminal}>
      <div className={styles.terminal_header}>
        <div className={styles.terminal_left}>
          <Icon className={styles.terminal_icon} />
          <span className={styles.terminal_title}>{displayTitle}</span>
        </div>
        <div className={styles.terminal_controls}>
          <span className={clsx(styles.dot, styles.red)}></span>
          <span className={clsx(styles.dot, styles.yellow)}></span>
          <span className={clsx(styles.dot, styles.green)}></span>
        </div>
      </div>

      <pre className={styles.terminal_body}>
        {lines.map((line, idx) => {
          const isCommand = line.startsWith("$ ") || line.startsWith("> ");
          const displayLine = isCommand ? line.slice(2) : line;

          return (
            <div
              key={idx}
              className={`${styles.terminal_line} ${isCommand ? styles.first_line : ""}`}
            >
              {isCommand && <span className={styles.prompt}>&gt;</span>}
              <span>{displayLine}</span>
            </div>
          );
        })}
      </pre>
    </div>
  );
}


Terminal.propTypes = {
  /** Terminal content to display inside the code block */
  children: PropTypes.node.isRequired,

  /** Optional terminal title displayed in the header */
  title: PropTypes.string,
};
