/**
 * 📊 BlueSkyLikes Component
 *
 * Displays the number of likes and reposts for a specific BlueSky post.
 * This component is conditionally rendered based on the presence of a `blueSkyRecordKey`
 * in the document's YAML frontmatter.
 *
 * 🔍 Behavior:
 * - If `blueSkyRecordKey` is missing or empty:
 *   → The component returns `null` and nothing is displayed.
 * - If present:
 *   → Fetches post metadata from the BlueSky public API and displays:
 *     • Total likes
 *
 * 🧾 Frontmatter Requirement:
 * ---
 * title: "My Post"
 * blueSkyRecordKey: 3lun2qjuxc22r
 * ---
 *
 * ⚙️ Configuration:
 * Ensure your BlueSky handle is defined in `docusaurus.config.js`:
 *
 * ```js
 * const config = {
 *   customFields: {
 *     blueSky: {
 *       handle: 'your-handle.bsky.social',
 *     },
 *   },
 * };
 * ```
 *
 * 📦 Props:
 * @param {object} props
 * @param {object} props.metadata - Docusaurus document metadata
 * @param {object} [props.metadata.frontMatter] - Frontmatter object
 * @param {string} [props.metadata.frontMatter.blueSkyRecordKey] - Unique key identifying the BlueSky post
 *
 * 🧠 Notes:
 * - Uses `useEffect` to fetch post stats asynchronously
 * - Gracefully handles loading and error states
 * - Requires BlueSky API access to retrieve post thread data
 */

import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import styles from "./styles.module.css";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

export default function BlueSkyLikes({ metadata }) {
  const { siteConfig } = useDocusaurusContext();
  const blueSkyConfig = siteConfig?.customFields?.blueSky;
  const blueSkyRecordKey = metadata?.frontMatter?.blueSkyRecordKey;

  // Consolidate state into a single object
  const [postStats, setPostStats] = useState({
    likes: null,
    reposts: null,
    loading: true,
  });

  useEffect(() => {
    // Only run if a BlueSky post exists
    if (!blueSkyRecordKey) {
      setPostStats({ likes: null, reposts: null, loading: false });
      return;
    }

    const fetchData = async () => {
      try {
        const postUri = `at://${blueSkyConfig.handle}/app.bsky.feed.post/${blueSkyRecordKey}`;
        const url = `https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?uri=${encodeURIComponent(
          postUri
        )}&depth=0`;

        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch post data");

        const data = await res.json();
        const { likeCount, repostCount } = data.thread.post;

        setPostStats({
          likes: likeCount,
          reposts: repostCount,
          loading: false,
        });
      } catch (e) {
        console.error("Error fetching BlueSky stats:", e);
        setPostStats({ likes: null, reposts: null, loading: false });
      }
    };

    fetchData();
  }, [blueSkyRecordKey, blueSkyConfig.handle]);

  if (postStats.loading) {
    return null;
  }

  if (postStats.likes === null) {
    return null;
  }

  return (
    <span className={styles.blueSkyPostLikes}>
      <span
        className={styles.blueSkyCommentLikes}
        title={`The original post has ${postStats.likes} likes on BlueSky`}
      >
        {postStats.likes}
      </span>
      <span
        className={styles.blueSkyCommentReposts}
        title={`The original post has been shared ${postStats.reposts} times on BlueSky`}
      >
        {postStats.reposts}
      </span>
    </span>
  );
}

BlueSkyLikes.propTypes = {
  metadata: PropTypes.shape({
    frontMatter: PropTypes.shape({
      blueSkyRecordKey: PropTypes.string, // Optional. If missing, the BlueSkyLikes component won't display anything
    }),
  }).isRequired,
};
