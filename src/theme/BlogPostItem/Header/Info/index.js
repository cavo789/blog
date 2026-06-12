import React from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
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
function DateTime({ date, formattedDate }) {
  return <time dateTime={date}>{formattedDate}</time>;
}
function Spacer() {
  return <>{" · "}</>;
}
function MainTagBadge({ mainTag, tags }) {
  const tagObj = tags.find((t) => t.label.toLowerCase() === mainTag.toLowerCase()
    || t.permalink.endsWith(`/${mainTag}`));
  if (!tagObj) return null;
  const permalink = tagObj.permalink.replace("/blog/tags/tags/", "/blog/tags/");
  return (
    <Link to={permalink} className={styles.mainTagBadge}>
      {tagObj.label}
    </Link>
  );
}

export default function BlogPostItemHeaderInfo({ className, aiIcon }) {
  const { metadata, isBlogPostPage } = useBlogPost();
  const { date, readingTime, tags, frontMatter } = metadata;
  const mainTag = frontMatter.mainTag;
  const dateTimeFormat = useDateTimeFormat({
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  const formatDate = (blogDate) => dateTimeFormat.format(new Date(blogDate));
  return (
    <div className={clsx(styles.container, "margin-vert--md", className)}>
      {isBlogPostPage && mainTag && tags?.length > 0 && (
        <>
          <MainTagBadge mainTag={mainTag} tags={tags} />
          <Spacer />
        </>
      )}
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
