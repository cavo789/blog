/**
 * StepsCard Component
 *
 * A reusable React component for rendering a sequence of instructional steps
 * in a visually styled card layout. Each step is numbered and supports Markdown
 * formatting for bold text and inline code.
 *
 * Features:
 * - Dark/light mode support via Docusaurus theme config
 * - Theme-aware styling using CSS variables
 * - Optional title displayed above the steps
 * - Markdown rendering for step content
 * - MDX compatibility for rich content injection
 *
 * Props:
 * @param {Array<string | React.ReactNode>} steps - An array of steps to display.
 *        Each step can be a plain string (with Markdown) or a React node.
 * @param {string} [title="Steps to follow"] - Optional title displayed above the steps.
 *
 * Example usage:
 * <StepsCard
 *   title="Publishing Workflow"
 *   steps={[
 *     'Write your article',
 *     'Share it on BlueSky',
 *     'Retrieve the **BlueSky Record key** from the post URL',
 *     'Add `blueSkyRecordKey: xxxx` to your article front matter',
 *     'Republish your article'
 *   ]}
 * />
 */

import { MDXProvider } from "@mdx-js/react";
import { useThemeConfig } from "@docusaurus/theme-common";
import PropTypes from "prop-types";
import styles from "./styles.module.css";

// Helper to render Markdown strings
function MDXContent({ children }) {
  return <div dangerouslySetInnerHTML={{ __html: childrenToHtml(children) }} />;
}

// Simple conversion: supports **bold** and `inline code`
function childrenToHtml(text) {
  if (!text) return "";
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/`(.*?)`/g, "<code>$1</code>");
}

export default function StepsCard({ steps, title = "Steps to follow"  }) {
  const { colorMode } = useThemeConfig(); // to support dark/light mode
  const primaryColor = "var(--ifm-color-primary)"; // theme primary
  const cardBg =
    colorMode === "dark"
      ? "var(--ifm-background-dark)"
      : "var(--ifm-background-color)";

  return (
    <MDXProvider>
      <div className={styles.steps_container}>
        <h3 className={styles.steps_title}>{title}</h3>
        {steps.map((step, index) => (
          <div
            key={index}
            className={styles.step_card}
            style={{ backgroundColor: cardBg }}
          >
            {/* Step number */}
            <div
              className={styles.step_number}
              style={{ backgroundColor: primaryColor }}
            >
              {index + 1}
            </div>

            {/* Step content */}
            <div className={styles.step_content}>
              {typeof step === "string" ? (
                <MDXContent>{step}</MDXContent>
              ) : (
                step
              )}
            </div>
          </div>
        ))}
      </div>
    </MDXProvider>
  );
}

StepsCard.propTypes = {
  /** Array of steps to display, as Markdown strings or React nodes */
  steps: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.node
    ])
  ).isRequired,

  /** Optional title displayed above the steps list */
  title: PropTypes.string
};
