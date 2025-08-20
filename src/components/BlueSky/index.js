/**
 * 🟦 BlueSky Component — Entry Point
 *
 * Dynamically renders a BlueSky interaction area for a Docusaurus document.
 * The component adapts its behavior based on the presence of a `blueSkyRecordKey`
 * in the document's YAML frontmatter.
 *
 * 🔀 Behavior:
 * - If `blueSkyRecordKey` is **absent**:
 *   → Display a share button (`<BlueSkyShare>`) allowing visitors to post the document to their own BlueSky profile.
 *
 * - If `blueSkyRecordKey` is **present**:
 *   → Display full post engagement UI:
 *     • `<BlueSkyPost>` — Like, share, and comment actions
 *     • `<BlueSkyLikes>` — Shows number of likes and reposts
 *     • `<BlueSkyComments>` — Displays threaded comments or a call-to-action if none exist
 *
 * 🧾 Frontmatter Example:
 * ---
 * title: "My Post"
 * blueSkyRecordKey: 3lun2qjuxc22r
 * ---
 *
 * ⚙️ Configuration:
 * To enable profile linking and post generation, add your BlueSky handle to `docusaurus.config.js`:
 *
 * ```js
 * const config = {
 *   customFields: {
 *     blueSky: {
 *       handle: 'avonture.be', // Your BlueSky handle
 *     },
 *   },
 * };
 * ```
 *
 * 📦 Props:
 * @param {object} props
 * @param {object} props.metadata - Docusaurus document metadata
 * @param {object} [props.metadata.frontMatter] - Frontmatter object
 * @param {string} [props.metadata.frontMatter.blueSkyRecordKey] - Unique key for the associated BlueSky post
 *
 * 🧩 Subcomponents:
 * - BlueSkyShare
 * - BlueSkyPost
 * - BlueSkyLikes
 * - BlueSkyComments
 */

import BlueSkyComments from "./comments";
import BlueSkyLikes from "./likes";
import BlueSkyPost from "./post";
import BlueSkyShare from "./share";
import PropTypes from "prop-types";

export default function BlueSky({ metadata }) {
  return (
    <div className="blueSkyContainer">
      {/*
        OPTION 1 - The blueSkyRecordKey is missing in the YAML frontmatter:

        - show a Share button so the visitor can sahre the post on his own BlueSky profile
      */}
      <BlueSkyShare metadata={metadata} />

      {/*
        OPTION 2 - The blueSkyRecordKey key is filled in so a BlueSky post already exists:

        - promote to like/share/comment it
        - show the number of likes/reposts
        - display the list of comments
      */}
      <BlueSkyPost metadata={metadata} />
      <BlueSkyLikes metadata={metadata} />
      <BlueSkyComments metadata={metadata} />
    </div>
  );
}

BlueSky.propTypes = {
  metadata: PropTypes.shape({
    frontMatter: PropTypes.shape({
      blueSkyRecordKey: PropTypes.string, // Optional
    }),
  }).isRequired,
};
