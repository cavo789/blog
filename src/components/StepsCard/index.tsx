import type { JSX, ReactNode } from "react";
import styles from "./styles.module.css";
import { parseMarkdown } from "@site/src/components/Blog/utils/markdown";

const VARIANT_ICONS = {
  steps: "",
  prerequisites: "",
  remember: "",
};

type Variant = keyof typeof VARIANT_ICONS;

interface StepObject {
  content: string | ReactNode;
  substeps?: (string | ReactNode)[];
}

type Step = string | StepObject;

interface Props {
  steps: Step[];
  title?: string;
  variant?: Variant;
}

export default function StepsCard({
  steps = [],
  title,
  variant = "steps",
}: Props): JSX.Element | null {
  if (!steps || steps.length === 0) return null;

  return (
    <div className={styles.steps_wrapper} data-variant={variant}>
      {title && (
        <h3 className={styles.steps_title}>
          <span aria-hidden="true">{VARIANT_ICONS[variant]}</span> {title}
        </h3>
      )}
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
  );
}
