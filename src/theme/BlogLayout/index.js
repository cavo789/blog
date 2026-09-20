import React from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import { translate } from "@docusaurus/Translate";
import { useStorageSlot } from "@docusaurus/theme-common";
import Layout from "@theme/Layout";
import BlogSidebar from "@theme/BlogSidebar";
import PanelToggleIcon from "@site/src/components/PanelToggleIcon";
import { HIDDEN_STORAGE_KEY } from "@theme/BlogSidebar/Desktop";

import styles from "./styles.module.css";

/**
 * Ejected only so `main` can reflow into the width the sidebar gives up when a reader collapses
 * it (see `BlogSidebar/Desktop`), and so the "show it again" toggle can live over the article
 * column once the sidebar has nothing left to render — mirroring claude.ai's own sidebar toggle,
 * which sits over the main pane rather than vanishing along with the panel it controls.
 *
 * Infima's `col--7` is a fixed 58.33% flex-basis with no grow, so it never fills space the
 * sidebar releases; `styles.mainWithSidebar` swaps that for flex-grow, and flexbox does the rest
 * as the sidebar's own width transitions.
 */
export default function BlogLayout(props) {
  const { sidebar, toc, children, ...layoutProps } = props;
  const hasSidebar = sidebar && sidebar.items.length > 0;
  const [hiddenValue, storageSlot] = useStorageSlot(
    hasSidebar ? HIDDEN_STORAGE_KEY : null,
  );
  const hidden = hasSidebar && (hiddenValue === null || hiddenValue === "true");

  return (
    <Layout {...layoutProps}>
      <div className="container margin-vert--lg">
        <div className="row">
          <BlogSidebar sidebar={sidebar} />
          <main
            className={clsx("col", {
              "col--7": hasSidebar,
              [styles.mainWithSidebar]: hasSidebar,
              "col--9 col--offset-1": !hasSidebar,
            })}
          >
            {hidden ? (
              <div className={styles.mainWithGutter}>
                <div className={styles.expandGutter}>
                  <button
                    type="button"
                    onClick={() => storageSlot.set("false")}
                    className={styles.expandButton}
                    aria-expanded={false}
                    aria-label={translate({
                      id: "theme.blog.sidebar.expandButtonTitle",
                      message: "Show the post list",
                      description:
                        "The title of the button that expands the collapsed blog sidebar",
                    })}
                    title={translate({
                      id: "theme.blog.sidebar.expandButtonTitle",
                      message: "Show the post list",
                      description:
                        "The title of the button that expands the collapsed blog sidebar",
                    })}
                  >
                    <PanelToggleIcon />
                  </button>
                </div>
                <div className={styles.mainContent}>{children}</div>
              </div>
            ) : (
              children
            )}
          </main>
          {toc && <div className="col col--2">{toc}</div>}
        </div>
      </div>
    </Layout>
  );
}

BlogLayout.propTypes = {
  sidebar: PropTypes.object,
  toc: PropTypes.node,
  children: PropTypes.node,
};
