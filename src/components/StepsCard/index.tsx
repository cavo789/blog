import type { JSX, ReactNode } from "react";
import styles from "./styles.module.css";
import { parseMarkdown } from "@site/src/components/Blog/utils/markdown";

type Variant = "steps" | "prerequisites" | "remember";

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

/**
 * StepsCard renders an ordered procedure as a rail-accented card.
 *
 * Markup notes (design harmonisation):
 *
 * - The title is a <p>, not an <h3>. It is styled as an eyebrow, so it no
 *   longer LOOKS like a heading — but as an <h3> it still sat in the document
 *   outline and in the table of contents, announcing "Steps" as a section of
 *   the article. Same correction as AlertBox's <h4>.
 *
 * - The empty <span aria-hidden>{VARIANT_ICONS[variant]}</span> is gone. The
 *   icon map had been emptied to "" for all three variants, but the span and
 *   the space after it were still rendered, leaving a stray leading space in
 *   every title.
 *
 * - The "remember" variant no longer puts an emoji in every bullet. An emoji
 *   inside a .mk-dot keeps its own colours and ignores --mk-on-line, so each
 *   bullet was a yellow blob on a terracotta disc. Numbered steps stay
 *   numbered; "remember" gets a bullet glyph the dot can actually ink.
 */
export default function StepsCard({
  steps = [],
  title,
  variant = "steps",
}: Props): JSX.Element | null {
  if (!steps || steps.length === 0) return null;

  return (
    <div className={styles.steps_wrapper} data-variant={variant}>
      {title && <p className={styles.steps_title}>{title}</p>}
      <ul className={styles.steps_list}>
        {steps.map((step, index) => {
          const isString = typeof step === "string";
          const content = isString ? step : step.content;
          const bullet = variant === "remember" ? "\u2022" : index + 1;

          return (
            <li key={index} className={styles.step_item}>
              <span className={styles.step_bullet} aria-hidden="true">
                {bullet}
              </span>
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
