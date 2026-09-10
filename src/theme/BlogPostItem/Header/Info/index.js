import React from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import { translate } from "@docusaurus/Translate";
import { usePluralForm } from "@docusaurus/theme-common";
import { useDateTimeFormat } from "@docusaurus/theme-common/internal";
import { useBlogPost } from "@docusaurus/plugin-content-blog/client";
import styles from "./styles.module.css";
// Very simple pluralization: probably good enough for now
function useReadingTimePlural() {
  const { selectMessage } = usePluralForm();
  return (readingTimeFloat) => {
    const readingTime = Math.ceil(readingTimeFloat);
    return selectMessage(
      readingTime,
      translate(
        {
          id: "theme.blog.post.readingTime.plurals",
          description:
            'Pluralized label for "{readingTime} min read". Use as much plural forms (separated by "|") as your language support (see https://www.unicode.org/cldr/cldr-aux/charts/34/supplemental/language_plural_rules.html)',
          message: "One min read|{readingTime} min read",
        },
        { readingTime },
      ),
    );
  };
}
function ReadingTime({ readingTime }) {
  const readingTimePlural = useReadingTimePlural();
  return <>{readingTimePlural(readingTime)}</>;
}
ReadingTime.propTypes = {
  readingTime: PropTypes.number.isRequired,
};
function DateTime({ date, formattedDate }) {
  return <time dateTime={date}>{formattedDate}</time>;
}
DateTime.propTypes = {
  date: PropTypes.string.isRequired,
  formattedDate: PropTypes.string.isRequired,
};
function Spacer() {
  return <>{" · "}</>;
}
export default function BlogPostItemHeaderInfo({ className, aiIcon }) {
  const { metadata } = useBlogPost();
  const { date, readingTime } = metadata;
  const dateTimeFormat = useDateTimeFormat({
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  const formatDate = (blogDate) => dateTimeFormat.format(new Date(blogDate));
  return (
    <div className={clsx(styles.container, "margin-vert--md", className)}>
      <DateTime date={date} formattedDate={formatDate(date)} />
      {typeof readingTime !== "undefined" && (
        <>
          <Spacer />
          <ReadingTime readingTime={readingTime} />
        </>
      )}
      {aiIcon && <Spacer />}
      {aiIcon}
    </div>
  );
}
BlogPostItemHeaderInfo.propTypes = {
  className: PropTypes.string,
  aiIcon: PropTypes.node,
};
