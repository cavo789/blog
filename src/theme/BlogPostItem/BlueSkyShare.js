/**
 * Renders a button to share the current post on Bluesky.
 *
 * See comments in BlueSky.js component for the list of requirements
 *
 * @param {Object} props
 * @param {string} props.title - The title of your page
 * @param {string} props.url - The full URL to the page
 */

import clsx from "clsx";
import PropTypes from "prop-types";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

export default function BlueSkyShare({ title, url }) {
  const { siteConfig } = useDocusaurusContext();

  if (!title || !url) {
    console.warn("<BlueSkyShare> Missing required properties", { title, url });
    return null;
  }

  const shareLink =
    `https://bsky.app/intent/compose?text=` +
    `${encodeURIComponent(title)}%20${siteConfig.url}${encodeURIComponent(
      url
    )}`;

  return (
    <a
      href={shareLink}
      target="_blank"
      rel="noopener noreferrer"
      className={clsx("blueSkyButton", "button")}
      aria-label="Share this post on BlueSky"
    >
      <img src="/img/bluesky.svg" alt="Bluesky Icon" width="20" height="20" />
      Share on BlueSky
    </a>
  );
}

BlueSkyShare.propTypes = {
  title: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
};
