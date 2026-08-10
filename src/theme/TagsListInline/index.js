import React from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import Translate from "@docusaurus/Translate";
import Tag from "@theme/Tag";
import styles from "./styles.module.css";

/**
 * Custom TagsListInline component.
 *
 * This file is needed to fix a bug where tag permalinks are generated with an incorrect
 * double path segment (e.g., '/blog/tags/tags/'). It normalizes these URLs to '/blog/tags/'.
 *
 * It also sorts the tags alphabetically (by label), regardless of the order in which
 * they were listed in the post's frontmatter.
 */
export default function TagsListInline({ tags }) {
  const sortedTags = [...tags].sort((a, b) => a.label.localeCompare(b.label));

  return (
    <>
      <b>
        <Translate
          id="theme.tags.tagsListLabel"
          description="The label alongside a tag list"
        >
          Tags:
        </Translate>
      </b>
      <ul className={clsx(styles.tags, "padding--none", "margin-left--sm")}>
        {sortedTags.map(({ label, permalink: tagPermalink }) => {
          const correctedPermalink = tagPermalink.replace(
            "/blog/tags/tags/",
            "/blog/tags/",
          );
          return (
            <li key={correctedPermalink} className={styles.tag}>
              <Tag label={label} permalink={correctedPermalink} />
            </li>
          );
        })}
      </ul>
    </>
  );
}
TagsListInline.propTypes = {
  tags: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      permalink: PropTypes.string.isRequired,
    }),
  ).isRequired,
};
