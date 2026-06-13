import PropTypes from "prop-types";
import { useState, useEffect, useCallback, useMemo } from "react";
import clsx from "clsx";
import Icon from "./icon.svg";
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

const CopyIcon = (props) => (
  <svg viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"
    />
  </svg>
);

const CheckIcon = (props) => (
  <svg viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"
    />
  </svg>
);

export default function Terminal({
  children,
  title,
  wrap = true,
  typewriter = false,
  typewriterSpeed = 40,
  typewriterLineDelay = 400,
}) {
  const displayTitle = title || "user@machine: ~/yourproject";
  const [copied, setCopied] = useState(false);

  // Extract lines once from children text content
  const animLines = useMemo(
    () => (typewriter ? getCopyText(children).split("\n") : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [typewriter]
  );

  const [revealedLines, setRevealedLines] = useState([]);
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [animDone, setAnimDone] = useState(false);

  // Animation tick: command lines type char-by-char; output lines appear whole
  useEffect(() => {
    if (!typewriter || animDone) return;

    if (lineIdx >= animLines.length) {
      setAnimDone(true);
      return;
    }

    const line = animLines[lineIdx];
    const isCommand = /^\s*[$#]/.test(line);

    if (isCommand && charIdx < line.length) {
      const t = setTimeout(() => setCharIdx((c) => c + 1), typewriterSpeed);
      return () => clearTimeout(t);
    }

    // Line complete — pause, then advance to next line
    const pause = line.trim() === "" ? 80 : typewriterLineDelay;
    const t = setTimeout(() => {
      setRevealedLines((prev) => [...prev, line]);
      setLineIdx((l) => l + 1);
      setCharIdx(0);
    }, pause);
    return () => clearTimeout(t);
  }, [typewriter, animDone, lineIdx, charIdx, animLines, typewriterSpeed, typewriterLineDelay]);

  const skipAnimation = useCallback(() => {
    if (!typewriter || animDone) return;
    setRevealedLines(animLines);
    setLineIdx(animLines.length);
    setAnimDone(true);
  }, [typewriter, animDone, animLines]);

  const handleCopy = useCallback(async () => {
    const textToCopy = getCopyText(children);
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  }, [children]);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  // Text shown during animation: revealed lines + current partial line
  const animDisplay = useMemo(() => {
    if (!typewriter || animDone) return null;
    const partial = animLines[lineIdx]?.slice(0, charIdx) ?? "";
    return [...revealedLines, partial].join("\n");
  }, [typewriter, animDone, revealedLines, lineIdx, charIdx, animLines]);

  const isAnimating = typewriter && !animDone;

  return (
    <div
      className={styles.terminal}
      onClick={skipAnimation}
      style={isAnimating ? { cursor: "pointer" } : undefined}
      title={isAnimating ? "Click to skip animation" : undefined}
    >
      <div className={styles.terminal_header}>
        <div className={styles.terminal_left}>
          <Icon className={styles.terminal_icon} />
          <span className={styles.terminal_title}>{displayTitle}</span>
        </div>
        <div className={styles.terminal_controls}>
          <span className={clsx(styles.dot, styles.red)} />
          <span className={clsx(styles.dot, styles.yellow)} />
          <span className={clsx(styles.dot, styles.green)} />
        </div>
      </div>

      <pre
        className={clsx(styles.terminal_body, {
          [styles.no_wrap]: !wrap,
        })}
      >
        {isAnimating ? (
          <>
            {animDisplay}
            <span className={styles.cursor} aria-hidden="true">▋</span>
          </>
        ) : (
          children
        )}
      </pre>

      <button
        type="button"
        aria-label="Copy code to clipboard"
        className={clsx(
          "clean-btn",
          "button--sm",
          "button--secondary",
          styles.copyButton,
          { [styles.copied]: copied }
        )}
        onClick={(e) => {
          e.stopPropagation(); // don't trigger skip
          handleCopy();
        }}
      >
        {copied ? (
          <CheckIcon className={styles.copyButtonSvg} />
        ) : (
          <CopyIcon className={styles.copyButtonSvg} />
        )}
      </button>
    </div>
  );
}

Terminal.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  wrap: PropTypes.bool,
  /** Enables typewriter animation — command lines ($/#) are typed char-by-char, output lines appear whole */
  typewriter: PropTypes.bool,
  /** Milliseconds per character for command lines (default: 40) */
  typewriterSpeed: PropTypes.number,
  /** Milliseconds to pause before revealing each output line (default: 400) */
  typewriterLineDelay: PropTypes.number,
};
