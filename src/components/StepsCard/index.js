import React from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import styles from "./styles.module.css";

const parseMarkdown = (text) => {
  if (typeof text !== "string") return text;
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/`(.*?)`/g, "<code>$1</code>")
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
    );
};

export default function StepsCard({ steps = [], title, variant = "steps" }) {
  if (!steps || steps.length === 0) return null;

  const variantIcons = {
    steps: "",
    prerequisites: "",
    remember: "",
  };

  return (
    /* Ajout des classes card et shadow--md pour matcher Updated */
    <div
      className={clsx(styles.steps_wrapper, "card", "shadow--md")}
      data-variant={variant}
    >
      {title && (
        <div className="card__header">
          <h3 className={styles.steps_title}>
            <span aria-hidden="true">{variantIcons[variant]}</span> {title}
          </h3>
        </div>
      )}
      <div className="card__body">
        <ul className={styles.steps_list}>
          {steps.map((step, index) => {
            const isString = typeof step === "string";
            const content = isString ? step : step.content;
            const icon = variant === "remember" ? "💡" : index + 1;

            return (
              <li key={index} className={styles.step_item}>
                <span className={styles.step_bullet}>{icon}</span>
                <div className={styles.step_content}>
                  {typeof content === "string" ? (
                    <span
                      dangerouslySetInnerHTML={{
                        __html: parseMarkdown(content),
                      }}
                    />
                  ) : (
                    content
                  )}
                  {!isString && step.substeps && (
                    <ul className={styles.substeps_list}>
                      {step.substeps.map((sub, i) => (
                        <li key={i}>
                          {typeof sub === "string" ? (
                            <span
                              dangerouslySetInnerHTML={{
                                __html: parseMarkdown(sub),
                              }}
                            />
                          ) : (
                            sub
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

StepsCard.propTypes = {
  steps: PropTypes.array.isRequired,
  title: PropTypes.string,
  variant: PropTypes.oneOf(["steps", "prerequisites", "remember"]),
};
