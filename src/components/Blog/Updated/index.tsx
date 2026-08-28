import type { JSX } from "react";
import clsx from "clsx";
import Translate from "@docusaurus/Translate";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { parseMarkdown } from "@site/src/components/Blog/utils/markdown";

import styles from "./styles.module.css";

interface UpdateEntry {
  date: string;
  note: string;
}

interface Props {
  updates?: UpdateEntry[];
}

export default function Updated({ updates }: Props): JSX.Element | null {
  const { i18n } = useDocusaurusContext();

  if (!updates || updates.length === 0) return null;

  const sortedUpdates = [...updates].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <div className={clsx(styles.revisionHistoryContainer, "margin-top--lg")}>
      <h3 className={styles.revisionHistoryTitle}>
        <span aria-hidden="true">📜</span>{" "}
        <Translate id="blog.updated.changelog">Changelog</Translate>
      </h3>
      <div className={styles.timeline}>
        {sortedUpdates.map((update, i) => {
          const isLatest = i === 0;
          return (
            <div
              key={`${update.date}-${i}`}
              className={clsx(
                styles.timelineItem,
                isLatest && styles.timelineItemLatest,
              )}
            >
              <div className={styles.timelineIcon}>
                <span aria-hidden="true">{isLatest ? "✨" : "📅"}</span>
              </div>
              <div className={styles.timelineContent}>
                <div className={styles.timelineDate}>
                  <time dateTime={update.date}>
                    {new Date(update.date).toLocaleDateString(
                      i18n.currentLocale,
                      { year: "numeric", month: "long", day: "numeric" },
                    )}
                  </time>
                  {isLatest && (
                    <span className={styles.latestBadge}>
                      <Translate id="blog.updated.latest">Latest</Translate>
                    </span>
                  )}
                </div>
                <div
                  className={styles.timelineDescription}
                  dangerouslySetInnerHTML={{
                    __html: parseMarkdown(update.note),
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
