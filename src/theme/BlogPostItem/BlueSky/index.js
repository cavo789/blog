/**
 * ===================================
 * = BlueSky component - Entry point =
 * ===================================
 *
 * Renders a BlueSky area where we'll have:
 *
 * OPTION 1
 * - A button to allow the visitor to share the post on his BlueSky profile (BlueSkyShare.js)
 *
 * OR
 *
 * OPTION 2
 * - A button to see (like/share/comment) the post on BlueSky (<BlueSkyPost>)
 * - The number of likes / repost on BlueSky (<BlueSkyLikes>)
 * - The list of comments for the post (<BlueSkyComments>) or a call-to-action link for engagement
 *
 * The difference will be the presence of the `blueSkyRecordKey` key or not in the YAML frontmatter of
 * the Docusaurus document.
 *
 * If there is no `blueSkyRecordKey` info (OPTION 1), there is no BlueSky post and thus we'll only show a button
 * to allow the visitor to share the document on his own profile.
 *
 * If present and not empty (OPTION 2), it means a BlueSky post exists for the document
 * and thus we can show the like/share/comment, the number of likes/repost and the list of comments.
 *
 * Here is an example of such YAML entry:
 *
 * ---
 * ...
 * blueSkyRecordKey: 3lun2qjuxc22r
 * ---
 *
 * In order to provide links to your own BlueSky profile, you'll have to add the blueSky entry
 * in the `docusaurus.config.js` file, for instance:
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
 * The handle should be initialized to the BlueSky handle of the author (you)
 *
 * @param {object} props
 * @param {object} props.metadata - The Docusaurus document metadata, including the frontmatter.
 * @param {object} [props.metadata.frontMatter] - The frontmatter object.
 * @param {string} [props.metadata.frontMatter.blueSkyRecordKey] - The unique key of the
 * corresponding BlueSky post. Its presence determines the component's behavior.
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
