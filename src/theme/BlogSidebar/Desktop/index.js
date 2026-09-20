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
import PanelToggleIcon from "@site/src/components/PanelToggleIcon";

import styles from "./styles.module.css";

/**
 * Ejected from `@docusaurus/theme-classic` (rather than a wrapping swizzle) so the sidebar can be
 * collapsed away entirely — like an editor's file-explorer toggle — freeing its width for the
 * article, instead of merely hiding the post titles inside an unchanged-width column. The freed
 * width is reclaimed by `main` in `@theme/BlogLayout` purely through flexbox (see its
 * `styles.mainWithSidebar`). `BlogLayout` also renders the matching "show it again" button once
 * this component has nothing left to render — see its own comment for why that lives there.
 */
export const HIDDEN_STORAGE_KEY = "docusaurus.blog.sidebar.hidden";

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

  // Nothing to render here once hidden: the toggle to bring it back lives in `BlogLayout`,
  // over the article column it just widened — see that file's comment.
  if (hidden) {
    return null;
  }

  const collapseLabel = translate({
    id: "theme.blog.sidebar.collapseButtonTitle",
    message: "Hide the post list",
    description: "The title of the button that collapses the blog sidebar",
  });

  return (
    <aside className={clsx("col", styles.sidebarContainer)}>
      <nav
        className={clsx(styles.sidebar, "thin-scrollbar")}
        aria-label={translate({
          id: "theme.blog.sidebar.navAriaLabel",
          message: "Blog recent posts navigation",
          description: "The ARIA label for recent posts in the blog sidebar",
        })}
      >
        <div className={clsx(styles.sidebarHeader, "margin-bottom--md")}>
          <button
            type="button"
            onClick={() => storageSlot.set("true")}
            className={styles.toggleButton}
            aria-expanded={true}
            aria-label={collapseLabel}
            title={collapseLabel}
          >
            <PanelToggleIcon />
          </button>
          <div className={styles.sidebarItemTitle}>{sidebar.title}</div>
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
