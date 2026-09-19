import React from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import Layout from "@theme/Layout";
import BlogSidebar from "@theme/BlogSidebar";

import styles from "./styles.module.css";

/**
 * Ejected only so `main` can reflow into the width the sidebar gives up when a reader collapses
 * it (see `BlogSidebar/Desktop`). Infima's `col--7` is a fixed 58.33% flex-basis with no grow, so
 * it never fills space the sidebar releases; `styles.mainWithSidebar` swaps that for flex-grow,
 * and flexbox does the rest as the sidebar's own width transitions — no collapsed/hidden state
 * needs to travel through this component at all.
 */
export default function BlogLayout(props) {
  const { sidebar, toc, children, ...layoutProps } = props;
  const hasSidebar = sidebar && sidebar.items.length > 0;

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
            {children}
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
