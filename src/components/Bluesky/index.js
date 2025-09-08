/**
 * 🟦 Bluesky Component — Entry Point
 *
 * Dynamically renders a Bluesky interaction area for a Docusaurus document.
 * The component adapts its behavior based on the presence of a `blueskyRecordKey`
 * in the document's YAML frontmatter.
 *
 * 🔀 Behavior:
 * - If `blueskyRecordKey` is **absent**:
 *   → Display a share button (`<BlueskyShare>`) allowing visitors to post the document to their own Bluesky profile.
 *
 * - If `blueskyRecordKey` is **present**:
 *   → Display full post engagement UI:
 *     • `<BlueskyPost>` — Like, share, and comment actions
 *     • `<BlueskyLikes>` — Shows number of likes and reposts
 *     • `<BlueskyComments>` — Displays threaded comments or a call-to-action if none exist
 *
 * 🧾 Frontmatter Example:
 * ---
 * title: "My Post"
 * blueskyRecordKey: 3lun2qjuxc22r
 * ---
 *
 * ⚙️ Configuration:
 * To enable profile linking and post generation, add your Bluesky handle to `docusaurus.config.js`:
 *
 * ```js
 * const config = {
 *   customFields: {
 *     blueSky: {
 *       handle: 'avonture.be', // Your Bluesky handle
 *     },
 *   },
 * };
 * ```
 *
 * 📦 Props:
 * @param {object} props
 * @param {object} props.metadata - Docusaurus document metadata
 * @param {object} [props.metadata.frontMatter] - Frontmatter object
 * @param {string} [props.metadata.frontMatter.blueskyRecordKey] - Unique key for the associated Bluesky post
 *
 * 🧩 Subcomponents:
 * - BlueskyShare
 * - BlueskyPost
 * - BlueskyLikes
 * - BlueskyComments
 */

import BlueskyComments from "./comments";
import BlueskyLikes from "./likes";
import BlueskyPost from "./post";
import BlueskyShare from "./share";
import PropTypes from "prop-types";

export default function Bluesky({ metadata }) {
  return (
    <div className="blueSkyContainer">
      {/*
        OPTION 1 - The blueskyRecordKey is missing in the YAML frontmatter:

        - show a Share button so the visitor can sahre the post on his own Bluesky profile
      */}
      <BlueskyShare metadata={metadata} />

      {/*
        OPTION 2 - The blueskyRecordKey key is filled in so a Bluesky post already exists:

        - promote to like/share/comment it
        - show the number of likes/reposts
        - display the list of comments
      */}
      <BlueskyPost metadata={metadata} />
      <BlueskyLikes metadata={metadata} />
      <BlueskyComments metadata={metadata} />
    </div>
  );
}

Bluesky.propTypes = {
  metadata: PropTypes.shape({
    frontMatter: PropTypes.shape({
      blueskyRecordKey: PropTypes.string, // Optional
    }),
  }).isRequired,
};
