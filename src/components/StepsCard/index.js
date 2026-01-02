/**
 * StepsCard Component
 *
 * A reusable React component for rendering a sequence of instructional steps,
 * prerequisites, or "things to remember" in a visually styled card layout.
 *
 * Features:
 * - Dark/light mode support via Docusaurus theme config
 * - Theme-aware styling using CSS variables
 * - Optional title displayed above the list
 * - Markdown rendering for step content
 * - MDX compatibility for rich content injection
 * - Visual variants for "steps" or "prerequisites"
 *
 * Props:
 * @param {Array<string | React.ReactNode>} steps - An array of items to display.
 *        Each item can be a plain string (with Markdown) or a React node.
 * @param {string} [title="Steps to follow"] - Optional title displayed above the list.
 * @param {string} [variant="steps"] - Visual style variant: "steps" (primary color) or "prerequisites" (neutral tone).
 *
 * Example usage (steps):
 * <StepsCard
 *   title="Publishing Workflow"
 *   steps={[
 *     'Write your article',
 *     'Share it on Bluesky',
 *     'Retrieve the **Bluesky Record key** from the post URL',
 *     'Add `blueskyRecordKey: xxxx` to your article front matter',
 *     'Republish your article',
 *     'Here’s the diagram: ![Diagram](./images/diagram.png)'
 *   ]}
 * />
 *
 * Example usage (prerequisites):
 *
 * <StepsCard
 *   title="Before You Begin"
 *   variant="prerequisites"
 *   steps={[
 *     "**Node.js** installed",
 *     "`admin` access to your dashboard",
 *     "A GitHub account",
 *     "Install the [CLI tool](https://example.com/cli)"
 *   ]}
 * />
 *
 * An example with sub steps
 *
 * <StepsCard
 *  title="Setting up Dev Container"
 *  steps={[
 *    "Start Visual Studio Code",
 *    "Press **CTRL+SHIFT+P** to open the Command Palette. ![Opening the Command Palette](./images/cmd-palette.png)",
 *    "Select `Dev Containers: Add Dev Container Configuration files...`",
 *    {
 *      content: "And follow the wizard:",
 *      substeps: [
 *        "Search for Python",
 *        "Select the most recent version of Python, right now it's `3.12-bullseye`",
 *        "Installing Python 3.12"
 *      ]
 *    }
 *  ]}
 * />
 */

import { MDXProvider } from "@mdx-js/react";
import { useThemeConfig } from "@docusaurus/theme-common";
import PropTypes from "prop-types";
import clsx from "clsx";
import styles from "./styles.module.css";

// Simple Markdown parser
function MDXContent({ children }) {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: children
          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
          .replace(/`(.*?)`/g, "<code>$1</code>"),
      }}
    />
  );
}

function StepItem({ step, index, level, variant, circleColor, cardBg }) {
  const content = typeof step === "string" ? step : step.content;
  const substeps = typeof step === "object" ? step.substeps : null;

  // Icon for "remember" variant
  const circleContent = variant === "remember" ? "💡" : index + 1;

  return (
    <div
      className={clsx(
        styles.step_card,
        level > 1 && styles.step_card_nested,
        variant === "remember" && styles.remember_bg
      )}
      style={{ backgroundColor: cardBg }}
    >
      <div
        className={clsx(
          styles.step_number,
          level > 1 && styles.step_number_nested
        )}
        style={{ backgroundColor: circleColor }}
      >
        {circleContent}
      </div>
      <div className={styles.step_content}>
        {typeof content === "string" ? (
          <MDXContent>{content}</MDXContent>
        ) : (
          content
        )}

        {substeps && substeps.length > 0 && (
          <div className={styles.substeps_container}>
            {substeps.map((substep, subIndex) => (
              <StepItem
                key={subIndex}
                step={substep}
                index={subIndex}
                level={level + 1}
                variant={variant}
                circleColor={circleColor}
                cardBg={cardBg}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function StepsCard({
  steps,
  title = "Steps to follow",
  variant = "steps"
}) {
  const { colorMode } = useThemeConfig();
  const primaryColor = "var(--ifm-color-primary)";
  const neutralColor =
    colorMode === "dark" ? "var(--ifm-color-secondary-dark)" : "#6b7280"; // gray-500

  let circleColor = primaryColor;
  let cardBg =
    colorMode === "dark"
      ? "var(--ifm-background-surface-color)"
      : "var(--ifm-background-color)";

  if (variant === "prerequisites") {
    circleColor = neutralColor;
  }

  if (variant === "remember") {
    circleColor = "var(--ifm-color-warning)";
    cardBg =
      colorMode === "dark"
        ? "rgba(255, 186, 0, 0.08)" // soft yellow background
        : "rgba(255, 237, 180, 0.4)";
  }

  return (
    <MDXProvider>
      <div className={styles.steps_container}>
        {title && <h3 className={styles.steps_title}>{title}</h3>}
        {steps.map((step, index) => (
          <StepItem
            key={index}
            step={step}
            index={index}
            level={1}
            variant={variant}
            circleColor={circleColor}
            cardBg={cardBg}
          />
        ))}
      </div>
    </MDXProvider>
  );
}

StepsCard.propTypes = {
  steps: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        content: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
        substeps: PropTypes.array
      })
    ])
  ).isRequired,
  title: PropTypes.string,
  variant: PropTypes.oneOf(["steps", "prerequisites", "remember"])
};
