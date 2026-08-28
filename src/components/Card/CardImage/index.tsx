/**
 * CardImage Component
 *
 * Renders an image for a card layout with optional lazy loading and
 * customizable size. Automatically resolves the image URL using Docusaurus's
 * `useBaseUrl` hook. Applies default styling via the "card__image" class
 * and supports additional custom styles.
 *
 * Notes:
 * - Using `width` and `height` helps reduce layout shift by reserving space
 *   for the image before it loads.
 * - You can also override sizing via CSS or the `style` prop if more flexibility is needed.
 */

import type { CSSProperties, JSX } from "react";
import clsx from "clsx";
import useBaseUrl from "@docusaurus/useBaseUrl";

interface Props {
  /** Optional additional CSS classes to apply. */
  className?: string;
  /** Inline styles for the image element. */
  style?: CSSProperties;
  /** Relative or absolute path to the image. */
  cardImageUrl: string;
  /** Alternative text for accessibility. */
  alt: string;
  /** Optional tooltip text shown on hover. */
  title?: string;
  /** If true, enables `loading="lazy"` to defer image loading until visible. */
  lazy?: boolean;
  /** Optional width of the image in pixels. */
  width?: number;
  /** Optional height of the image in pixels. */
  height?: number;
}

const CardImage = ({
  className,
  style,
  cardImageUrl,
  alt,
  title,
  lazy = true,
  width,
  height,
}: Props): JSX.Element => {
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

export default CardImage;
