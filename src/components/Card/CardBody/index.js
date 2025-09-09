import React, { CSSProperties } from "react";
import clsx from "clsx";
import styles from "../styles.module.css";
const CardBody = ({
  className, // className for the container card
  style, // Custom styles for the container card
  children, // Content to be included within the card
  textAlign,
  variant,
  italic = false,
  noDecoration = false,
  transform,
  truncate = false,
  weight,
}) => {
  const text = textAlign ? `text--${textAlign}` : "";
  const textColor = variant ? `text--${variant}` : "";
  const textItalic = italic ? "text--italic" : "";
  const textDecoration = noDecoration ? "text-no-decoration" : "";
  const textType = transform ? `text--${transform}` : "";
  const textTruncate = truncate ? styles.truncate : "";
  const textWeight = weight ? `text--${weight}` : "";
  return (
    <div
      className={clsx(
        "card__body",
        className,
        text,
        textType,
        textColor,
        textItalic,
        textDecoration,
        textTruncate,
        textWeight
      )}
      style={style}
    >
      {children}
    </div>
  );
};
export default CardBody;
