import PropTypes from "prop-types";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
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

// Auto-scales speed based on line count so long terminals don't drag on.
// Explicit props always take priority over these defaults.
function autoSpeed(lineCount) {
  if (lineCount <= 5)  return { speed: 40, delay: 400 };
  if (lineCount <= 10) return { speed: 25, delay: 200 };
  if (lineCount <= 20) return { speed: 20, delay: 150 };
  return                      { speed: 12, delay: 100 };
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
  typewriterSpeed,
  typewriterLineDelay,
}) {
  const displayTitle = title || "user@machine: ~/yourproject";
  const containerRef = useRef(null);
  const [copied, setCopied] = useState(false);

  // Extract lines once from children text content
  const animLines = useMemo(
    () => (typewriter ? getCopyText(children).split("\n") : []),
    // children is static MDX content — recompute only if typewriter flag changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [typewriter]
  );

  // Effective speed: explicit prop wins; otherwise auto-scale to line count
  const { speed: effectiveSpeed, delay: effectiveDelay } = useMemo(() => {
    const auto = autoSpeed(animLines.length);
    return {
      speed: typewriterSpeed ?? auto.speed,
      delay: typewriterLineDelay ?? auto.delay,
    };
  }, [animLines.length, typewriterSpeed, typewriterLineDelay]);

  // Start animation only when the terminal scrolls into view
  const [hasBeenVisible, setHasBeenVisible] = useState(false);

  useEffect(() => {
    if (!typewriter) return;
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      // Fallback for environments without IntersectionObserver (SSR, old browsers)
      setHasBeenVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasBeenVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [typewriter]);

  const [revealedLines, setRevealedLines] = useState([]);
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [animDone, setAnimDone] = useState(false);

  // Animation tick — only runs once the component is visible
  useEffect(() => {
    if (!typewriter || !hasBeenVisible || animDone) return;

    if (lineIdx >= animLines.length) {
      setAnimDone(true);
      return;
    }

    const line = animLines[lineIdx];
    const isCommand = /^\s*[$#]/.test(line);

    if (isCommand && charIdx < line.length) {
      const t = setTimeout(() => setCharIdx((c) => c + 1), effectiveSpeed);
      return () => clearTimeout(t);
    }

    // Line complete — pause then advance
    const pause = line.trim() === "" ? 80 : effectiveDelay;
    const t = setTimeout(() => {
      setRevealedLines((prev) => [...prev, line]);
      setLineIdx((l) => l + 1);
      setCharIdx(0);
    }, pause);
    return () => clearTimeout(t);
  }, [typewriter, hasBeenVisible, animDone, lineIdx, charIdx, animLines, effectiveSpeed, effectiveDelay]);

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

  const animDisplay = useMemo(() => {
    if (!typewriter || animDone) return null;
    const partial = animLines[lineIdx]?.slice(0, charIdx) ?? "";
    return [...revealedLines, partial].join("\n");
  }, [typewriter, animDone, revealedLines, lineIdx, charIdx, animLines]);

  const isAnimating = typewriter && !animDone;

  return (
    <div
      ref={containerRef}
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
          e.stopPropagation();
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
  /** Enables typewriter animation. Command lines ($/#) typed char-by-char; output lines appear whole. Click to skip. */
  typewriter: PropTypes.bool,
  /** ms per character on command lines. Omit to auto-scale based on line count. */
  typewriterSpeed: PropTypes.number,
  /** ms before each output line appears. Omit to auto-scale based on line count. */
  typewriterLineDelay: PropTypes.number,
};
