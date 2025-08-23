import PropTypes from "prop-types";
import { useState, useRef, useEffect } from "react";
import clsx from "clsx";
import Icon from "./icon.svg"; // your SVG
import styles from "./styles.module.css";

function getCopyText(children) {
  let text = "";
  if (Array.isArray(children)) {
    children.forEach((child, index) => {
      text += getCopyText(child);
      if (index < children.length - 1) {
        text += "\n";
      }
    });
  } else if (typeof children === "string") {
    text += children;
  } else if (typeof children === "object" && children !== null) {
    if (children.props?.children) {
      text += getCopyText(children.props.children);
    }
  }
  return text;
}

export default function Terminal({ children, title, wrap = true }) {
  const displayTitle = title || "christophe@machine: ~";
  const [copied, setCopied] = useState(false);
  const codeRef = useRef(null);

  const handleCopy = async () => {
    const textToCopy = getCopyText(children);
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  return (
    <div className={clsx(styles.terminal, styles.codeBlock)}>
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

      <pre
        ref={codeRef}
        className={clsx(styles.terminal_body, {
          [styles.no_wrap]: !wrap,
        })}
      >
        {children}
      </pre>

      <button
        type="button"
        aria-label="Copy code to clipboard"
        className={clsx(
          "clean-btn", // Docusaurus's base style for buttons
          "button--sm", // Small button size
          "button--secondary", // Secondary color for hover effect
          styles.copyButton, // Your custom styles for position and behavior
          {
            [styles.copied]: copied, // State-based class for feedback
          }
        )}
        onClick={handleCopy}
      >
        {copied ? (
          <CheckIcon className={clsx(styles.copyButtonSvg)} />
        ) : (
          <CopyIcon className={clsx(styles.copyButtonSvg)} />
        )}
      </button>
    </div>
  );
}

Terminal.propTypes = {
  /** Terminal content to display inside the code block */
  children: PropTypes.node.isRequired,

  /** Optional terminal title displayed in the header */
  title: PropTypes.string,

  /** Enable or disable word wrap in the terminal body (default: true) */
  wrap: PropTypes.bool,
};

// SVG icons for the button, using `fill="currentColor"` for theming
const CopyIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"
    ></path>
  </svg>
);

const CheckIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"
    ></path>
  </svg>
);