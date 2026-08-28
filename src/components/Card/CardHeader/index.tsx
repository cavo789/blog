import type { CSSProperties, JSX, ReactNode } from "react";
import clsx from "clsx"; // clsx helps manage conditional className names in a clean and concise manner.
import styles from "../styles.module.css";
import { buildTextClasses, type CardTextOptions } from "../utils";

interface Props extends CardTextOptions {
  /** className for the container card */
  className?: string;
  /** Custom styles for the container card */
  style?: CSSProperties;
  /** Content to be included within the card */
  children?: ReactNode;
}

const CardHeader = ({
  className,
  style,
  children,
  textAlign,
  variant,
  italic = false,
  noDecoration = false,
  transform,
  truncate = false,
  weight,
}: Props): JSX.Element => {
  const {
    text,
    textColor,
    textItalic,
    textDecoration,
    textType,
    textTruncate,
    textWeight,
  } = buildTextClasses(
    { textAlign, variant, italic, noDecoration, transform, truncate, weight },
    styles.truncate,
  );
  return (
    <div
      className={clsx(
        "card__header",
        className,
        text,
        textType,
        textColor,
        textItalic,
        textDecoration,
        textTruncate,
        textWeight,
      )}
      style={style}
    >
      {children}
    </div>
  );
};

export default CardHeader;
