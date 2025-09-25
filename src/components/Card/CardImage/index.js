import React, { CSSProperties } from "react";
import clsx from "clsx";
import useBaseUrl from "@docusaurus/useBaseUrl";
const CardImage = ({ className, style, cardImageUrl, alt, title }) => {
  const generatedCardImageUrl = useBaseUrl(cardImageUrl);
  return (
    <img
      className={clsx("card__image", className)}
      style={style}
      src={generatedCardImageUrl}
      alt={alt}
      title={title}
      loading="lazy"
    />
  );
};
export default CardImage;
