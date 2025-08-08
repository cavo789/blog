/**
 * Renders a BlueSky area where we'll have:
 *
 * - A button to see (like/comment) the post on BlueSky
 * - A button to allow the visitor to share the post on his BlueSky profile
 * - An area with comments posted on the BlueSky post if any
 *
 * Requirements:
 *
 * - `blueSkyRecordKey` must be provided in the post's YAML frontmatter.
 *   (It's the hash at the end of the URL when you consult a post on BlueSky)
 *
 * - In `docusaurus.config.js`, you must configure something like:
 *
 *     const config = {
 *       ...
 *       customFields: {
 *         blueSky: {
 *           handle: 'avonture.be',
 *         },
 *       },
 *     }
 * Also, your Docusauraus document has to provide the "blueSkyRecordKey" in his YAML frontmatter.
 * Here is an example:
 *
 * ---
 * ...
 * blueSkyRecordKey: 3lun2qjuxc22r
 * ---
 *
 * @param {Object} props
 * @param {string} props.recordKey - Unique record from the frontmatter
 */

import PropTypes from "prop-types";
import BlueSkyComments from "./BlueSkyComments";
import BlueSkyPost from "./BlueSkyPost";
import BlueSkyShare from "./BlueSkyShare";

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
