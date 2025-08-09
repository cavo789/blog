/**
 * ===================================
 * = BlueSky component - Entry point =
 * ===================================
 * 
 * Renders a BlueSky area where we'll have:
 *
 * - A button to see (like/comment) the post on BlueSky (BlueSkyPost.js)
 * - A button to allow the visitor to share the post on his BlueSky profile (BlueSkyShare.js)
 * - An area with comments posted on the BlueSky post if any (BlueSkyComment.js)
 *
 * Requirements:
 *
 * 1. A `blueSkyRecordKey` key must be provided in the post's YAML frontmatter.
 *    (It's the hash at the end of the URL when you consult a post on BlueSky)
 * 
 *    1. When the Docusaurus document didn't have it, the BlueSky component will only display 
 *       a Share button (BlueSkyShare.js)
 *    2. If there is one (and thus the post has been shared on BlueSky), the BlueSkyPost.js button
 *       will be displayed and, if any, the list of comments on that BlueSky post (BlueSkyComments.js).
 *
 *    Here is an example of such YAML entry:
 *
 *    ---
 *    ...
 *    blueSkyRecordKey: 3lun2qjuxc22r
 *    ---
 *
 * 2. In `docusaurus.config.js`, you must configure something like:
 *
 *      const config = {
 *        ...
 *        customFields: {
 *          blueSky: {
 *            handle: 'avonture.be',
 *          },
 *        },
 *      }
 * 
 * @param {Object} props
 * @param {string} props.recordKey - Unique record from the frontmatter
 */

import PropTypes from "prop-types";
import BlueSkyComments from "./comments";
import BlueSkyPost from "./post";
import BlueSkyShare from "./share";

export default function BlueSky({ metadata }) {
  return (
    <div className="blueSkyContainer">
      <BlueSkyPost recordKey={metadata.frontMatter.blueSkyRecordKey} />
      <BlueSkyShare title={metadata.title} url={metadata.permalink} />
      <BlueSkyComments recordKey={metadata.frontMatter.blueSkyRecordKey} />
    </div>
  );
}

BlueSky.propTypes = {
  metadata: PropTypes.string.isRequired,
};
