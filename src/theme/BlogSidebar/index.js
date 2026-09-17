import BlogSidebar from "@theme-original/BlogSidebar";
import PropTypes from "prop-types";
import React from "react";
import { useTranslationState } from "@site/src/components/Blog/utils/translations";
import { slugFromPermalink } from "@site/src/components/Blog/utils/translations";

/**
 * Wraps the theme's BlogSidebar to hide untranslated articles in a non-default locale.
 *
 * The sidebar's items come from the blog plugin (`blogSidebarCount: "ALL"`), which lists the
 * whole corpus — and Docusaurus's i18n fallback gives every English article a live `/fr/` route.
 * So a French reader saw all 257 entries, in English, next to an article that is translated.
 *
 * A **wrapping** swizzle rather than an ejecting one: only the item list needs filtering, and
 * wrapping keeps the theme's own markup, styles and future updates. Filtering is a no-op on the
 * default locale, so the English sidebar is byte-for-byte what it was.
 *
 * See TODO 0119.
 */
export default function BlogSidebarWrapper(props) {
  const { isDefaultLocale, isTranslated } = useTranslationState();

  if (isDefaultLocale || !props.sidebar?.items) {
    return <BlogSidebar {...props} />;
  }

  const items = props.sidebar.items.filter((item) =>
    isTranslated(slugFromPermalink(item.permalink)),
  );

  return <BlogSidebar {...props} sidebar={{ ...props.sidebar, items }} />;
}

BlogSidebarWrapper.propTypes = {
  sidebar: PropTypes.shape({
    title: PropTypes.string,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        title: PropTypes.string,
        permalink: PropTypes.string,
      }),
    ),
  }),
};
