import React, { memo } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import { translate } from "@docusaurus/Translate";
import {
  useVisibleBlogSidebarItems,
  BlogSidebarItemList,
} from "@docusaurus/plugin-content-blog/client";
import { useStorageSlot } from "@docusaurus/theme-common";
import BlogSidebarContent from "@theme/BlogSidebar/Content";

import styles from "./styles.module.css";

/**
 * Ejected from `@docusaurus/theme-classic` (rather than a wrapping swizzle) so the sidebar can be
 * collapsed down to a slim strip — like an editor's file-explorer toggle — freeing its width for
 * the article, instead of merely hiding the post titles inside an unchanged-width column. The
 * freed width is reclaimed by `main` in `@theme/BlogLayout` purely through flexbox (see its
 * `styles.mainWithSidebar`): this component only has to shrink its own flex-basis.
 */
const HIDDEN_STORAGE_KEY = "docusaurus.blog.sidebar.hidden";

const ListComponent = ({ items }) => {
  return (
    <BlogSidebarItemList
      items={items}
      ulClassName={clsx(styles.sidebarItemList, "clean-list")}
      liClassName={styles.sidebarItem}
      linkClassName={styles.sidebarItemLink}
      linkActiveClassName={styles.sidebarItemLinkActive}
    />
  );
};
ListComponent.propTypes = {
  items: PropTypes.array.isRequired,
};

function BlogSidebarDesktop({ sidebar }) {
  const items = useVisibleBlogSidebarItems(sidebar.items);
  const [hiddenValue, storageSlot] = useStorageSlot(HIDDEN_STORAGE_KEY);
  // No stored preference yet (first visit) → closed by default, so the article gets the full
  // width from the start instead of only after the reader discovers the toggle.
  const hidden = hiddenValue === null ? true : hiddenValue === "true";

  const navAriaLabel = translate({
    id: "theme.blog.sidebar.navAriaLabel",
    message: "Blog recent posts navigation",
    description: "The ARIA label for recent posts in the blog sidebar",
  });

  if (hidden) {
    const expandLabel = translate({
      id: "theme.blog.sidebar.expandButtonTitle",
      message: "Show the post list",
      description: "The title of the button that expands the collapsed blog sidebar",
    });

    return (
      <aside
        className={clsx("col", styles.sidebarContainer, styles.sidebarContainerHidden)}
      >
        <nav className={clsx(styles.sidebar, "thin-scrollbar")} aria-label={navAriaLabel}>
          <button
            type="button"
            onClick={() => storageSlot.set("false")}
            className={styles.expandStrip}
            aria-expanded={false}
            aria-label={expandLabel}
            title={expandLabel}
          />
        </nav>
      </aside>
    );
  }

  const collapseLabel = translate({
    id: "theme.blog.sidebar.collapseButtonTitle",
    message: "Hide the post list",
    description: "The title of the button that collapses the blog sidebar",
  });

  return (
    <aside className={clsx("col", styles.sidebarContainer)}>
      <nav className={clsx(styles.sidebar, "thin-scrollbar")} aria-label={navAriaLabel}>
        <div className={clsx(styles.sidebarHeader, "margin-bottom--md")}>
          <div className={styles.sidebarItemTitle}>{sidebar.title}</div>
          <button
            type="button"
            onClick={() => storageSlot.set("true")}
            className={styles.collapseButton}
            aria-expanded={true}
            aria-label={collapseLabel}
            title={collapseLabel}
          />
        </div>
        <BlogSidebarContent
          items={items}
          ListComponent={ListComponent}
          yearGroupHeadingClassName={styles.yearGroupHeading}
        />
      </nav>
    </aside>
  );
}

BlogSidebarDesktop.propTypes = {
  sidebar: PropTypes.shape({
    title: PropTypes.string,
    items: PropTypes.array,
  }).isRequired,
};

export default memo(BlogSidebarDesktop);
