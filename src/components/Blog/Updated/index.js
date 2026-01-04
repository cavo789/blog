import React from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import Translate from "@docusaurus/Translate";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

import styles from "./styles.module.css";

function parseMarkdown(text) {
  if (!text) return "";

  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, "<code>$1</code>")
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
    );
}

export default function Updated({ updates }) {
  const { i18n } = useDocusaurusContext();

  if (!updates || updates.length === 0) return null;

  const sortedUpdates = [...updates].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  return (
    <div className={clsx(styles.revisionHistoryContainer, "margin-top--lg")}>
      <h3 className={styles.revisionHistoryTitle}>
        <span aria-hidden="true">📜</span>{" "}
        <Translate id="blog.updated.changelog">Changelog</Translate>
      </h3>
      <div className={styles.timeline}>
        {sortedUpdates.map((update, i) => (
          <div key={`${update.date}-${i}`} className={styles.timelineItem}>
            <div className={styles.timelineIcon}>
              <span aria-hidden="true">📅</span>
            </div>
            <div className={styles.timelineContent}>
              <div className={styles.timelineDate}>
                <time dateTime={update.date}>
                  {new Date(update.date).toLocaleDateString(
                    i18n.currentLocale,
                    { year: "numeric", month: "long", day: "numeric" }
                  )}
                </time>
              </div>
              <div
                className={styles.timelineDescription}
                dangerouslySetInnerHTML={{
                  __html: parseMarkdown(update.note),
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

Updated.propTypes = {
  updates: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      note: PropTypes.string.isRequired,
    })
  ),
};
