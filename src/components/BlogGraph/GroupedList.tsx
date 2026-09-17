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
import Translate from "@docusaurus/Translate";
import { useTagLabel } from "@site/src/components/Blog/utils/tagsI18n";
import { groupByMainTag, type BlogGraphNode } from "./utils";
import styles from "./styles.module.css";

interface Props {
  nodes: BlogGraphNode[];
}

export default function GroupedList({ nodes }: Props) {
  const groups = groupByMainTag(nodes);
  const tagLabel = useTagLabel();

  return (
    <div className={styles.groupedList}>
      {groups.map(([mainTag, posts]) => (
        <section key={mainTag} className={styles.group}>
          <h3 className={styles.groupTitle}>
            {/* "other" is `groupByMainTag`'s bucket for articles with no mainTag — it is not a
                tags.yml key, so it has no label to look up and needs its own UI string. */}
            {mainTag === "other" ? (
              <Translate id="blog.graph.group.other">Other</Translate>
            ) : (
              tagLabel(mainTag)
            )}{" "}
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
