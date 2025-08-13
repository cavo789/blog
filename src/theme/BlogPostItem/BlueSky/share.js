/**
 * Renders a button to share the current post on Bluesky.
 *
 * This button will displayed ONLY when the post DON'T HAVEs, in his YAML frontmatter, the
 * blueSkyRecordKey entry i.e. the hash of the BlueSky post.
 *
 * If the post don't have, provide the Share button but, if he has, the BlueSkyPost component
 * will allow the user the like, comment and repost the article.
 *
 * See comments in BlueSky.js component for the list of requirements
 *
 * @param {object} props
 * @param {object} props.metadata - The Docusaurus document metadata, including the frontmatter.
 * @param {object} props.metadata.title - The title of the document.
 * @param {object} props.metadata.permalink - The document url (complete).
 * @param {object} [props.metadata.frontMatter] - The frontmatter object.
 * @param {string} [props.metadata.frontMatter.blueSkyRecordKey] - The unique key of the
 * corresponding BlueSky post. Its presence determines the component's behavior.
 */

import clsx from "clsx";
import PropTypes from "prop-types";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

export default function BlueSkyShare({ metadata }) {
  const blueSkyRecordKey = metadata?.frontMatter?.blueSkyRecordKey;

  if (blueSkyRecordKey) return;

  const { siteConfig } = useDocusaurusContext();

  console.log(metadata);

  if (!metadata.title || !metadata.permalink) {
    console.debug("<BlueSkyShare> Missing required properties", { metadata });
    return null;
  }

  const shareLink =
    `https://bsky.app/intent/compose?text=` +
    `${encodeURIComponent(metadata.title)}%20${siteConfig.url}${encodeURIComponent(
      metadata.permalink
    )}`;

  return (
    <a href={shareLink} target="_blank" rel="noopener noreferrer" className={clsx("blueSkyButton", "button")} aria-label="Share this post on BlueSky">
      <img src="/img/bluesky.svg" alt="Bluesky Icon" width="20" height="20" />
      Share on BlueSky
    </a>
  );
}

BlueSkyShare.propTypes = {
  metadata: PropTypes.shape({
    title: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    frontMatter: PropTypes.shape({
      blueSkyRecordKey: PropTypes.string // Optional. If present this component will not display anything
    })
  }).isRequired
};
