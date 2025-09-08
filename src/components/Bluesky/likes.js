/**
 * 📊 BlueskyLikes Component
 *
 * Displays the number of likes and reposts for a specific Bluesky post.
 * This component is conditionally rendered based on the presence of a `blueskyRecordKey`
 * in the document's YAML frontmatter.
 *
 * 🔍 Behavior:
 * - If `blueskyRecordKey` is missing or empty:
 *   → The component returns `null` and nothing is displayed.
 * - If present:
 *   → Fetches post metadata from the Bluesky public API and displays:
 *     • Total likes
 *
 * 🧾 Frontmatter Requirement:
 * ---
 * title: "My Post"
 * blueskyRecordKey: 3lun2qjuxc22r
 * ---
 *
 * ⚙️ Configuration:
 * Ensure your Bluesky handle is defined in `docusaurus.config.js`:
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
 * @param {string} [props.metadata.frontMatter.blueskyRecordKey] - Unique key identifying the Bluesky post
 *
 * 🧠 Notes:
 * - Uses `useEffect` to fetch post stats asynchronously
 * - Gracefully handles loading and error states
 * - Requires Bluesky API access to retrieve post thread data
 */

import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import styles from "./styles.module.css";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

export default function BlueskyLikes({ metadata }) {
  const { siteConfig } = useDocusaurusContext();
  const blueSkyConfig = siteConfig?.customFields?.bluesky;
  const blueskyRecordKey = metadata?.frontMatter?.blueskyRecordKey;

  // Consolidate state into a single object
  const [postStats, setPostStats] = useState({
    likes: null,
    reposts: null,
    loading: true,
  });

  useEffect(() => {
    // Only run if a Bluesky post exists
    if (!blueskyRecordKey) {
      setPostStats({ likes: null, reposts: null, loading: false });
      return;
    }

    const fetchData = async () => {
      try {
        const postUri = `at://${blueSkyConfig.handle}/app.bsky.feed.post/${blueskyRecordKey}`;
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
        console.error("Error fetching Bluesky stats:", e);
        setPostStats({ likes: null, reposts: null, loading: false });
      }
    };

    fetchData();
  }, [blueskyRecordKey, blueSkyConfig.handle]);

  if (postStats.loading) {
    return null;
  }

  if (postStats.likes === null) {
    return null;
  }

  return (
    <span className={styles.blueskyPostLikes}>
      <span
        className={styles.blueskyCommentLikes}
        title={`The original post has ${postStats.likes} likes on Bluesky`}
      >
        {postStats.likes}
      </span>
      <span
        className={styles.blueskyCommentReposts}
        title={`The original post has been shared ${postStats.reposts} times on Bluesky`}
      >
        {postStats.reposts}
      </span>
    </span>
  );
}

BlueskyLikes.propTypes = {
  metadata: PropTypes.shape({
    frontMatter: PropTypes.shape({
      blueskyRecordKey: PropTypes.string, // Optional. If missing, the BlueskyLikes component won't display anything
    }),
  }).isRequired,
};
