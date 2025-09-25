/**
 * CardImage Component
 *
 * Renders an image for a card layout with optional lazy loading and
 * customizable size. Automatically resolves the image URL using Docusaurus's
 * `useBaseUrl` hook. Applies default styling via the "card__image" class
 * and supports additional custom styles.
 *
 * Props:
 * - className (string): Optional additional CSS classes to apply.
 * - style (object): Inline styles for the image element.
 * - cardImageUrl (string, required): Relative or absolute path to the image.
 * - alt (string, required): Alternative text for accessibility.
 * - title (string): Optional tooltip text shown on hover.
 * - lazy (boolean): If true, enables `loading="lazy"` to defer image loading
 *                   until visible. If false, loads the image immediately
 *                   (useful for above-the-fold content).
 * - width (number): Optional width of the image in pixels.
 * - height (number): Optional height of the image in pixels.
 *
 * Notes:
 * - Using `width` and `height` helps reduce layout shift by reserving space
 *   for the image before it loads.
 * - You can also override sizing via CSS or the `style` prop if more flexibility is needed.
 */

import PropTypes from "prop-types";
import clsx from "clsx";
import useBaseUrl from "@docusaurus/useBaseUrl";

const CardImage = ({
  className,
  style,
  cardImageUrl,
  alt,
  title,
  lazy = true,
  width,
  height,
}) => {
  const generatedCardImageUrl = useBaseUrl(cardImageUrl);

  return (
    <img
      className={clsx("card__image", className)}
      style={style}
      src={generatedCardImageUrl}
      alt={alt}
      title={title}
      loading={lazy ? "lazy" : undefined}
      width={width}
      height={height}
    />
  );
};

CardImage.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object,
  cardImageUrl: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  title: PropTypes.string,
  lazy: PropTypes.bool,
  width: PropTypes.number,
  height: PropTypes.number,
};

export default CardImage;
