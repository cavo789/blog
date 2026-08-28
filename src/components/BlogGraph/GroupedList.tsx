/**
 * The graph's fallback rendering — a plain list of every article grouped by mainTag.
 *
 * Used in two situations, per 0081's accessibility requirements:
 * - Always server-rendered, so the page stays indexable and useful with JavaScript
 *   disabled (the canvas graph is a progressive enhancement on top of this, not a
 *   replacement for it).
 * - Kept as the *only* rendering on narrow viewports, where a force-directed graph has no
 *   room to be legible (BlogGraph swaps to this below the mobile breakpoint).
 */

import Link from "@docusaurus/Link";
import { groupByMainTag, humanizeTag, type BlogGraphNode } from "./utils";
import styles from "./styles.module.css";

interface Props {
  nodes: BlogGraphNode[];
}

export default function GroupedList({ nodes }: Props) {
  const groups = groupByMainTag(nodes);

  return (
    <div className={styles.groupedList}>
      {groups.map(([mainTag, posts]) => (
        <section key={mainTag} className={styles.group}>
          <h3 className={styles.groupTitle}>
            {humanizeTag(mainTag)}{" "}
            <span className={styles.groupCount}>({posts.length})</span>
          </h3>
          <ul className={styles.groupItems}>
            {posts.map((post) => (
              <li key={post.permalink}>
                <Link to={post.permalink}>{post.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
