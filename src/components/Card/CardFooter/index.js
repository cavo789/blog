import PropTypes from "prop-types";
import styles from "../styles.module.css";
import { buildTextClasses } from "../utils";

import clsx from "clsx";
const CardFooter = ({
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
}) => {
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
        "card__footer",
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

CardFooter.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object,
  children: PropTypes.node,
  textAlign: PropTypes.oneOf(["left", "center", "right", "justify"]),
  variant: PropTypes.string,
  italic: PropTypes.bool,
  noDecoration: PropTypes.bool,
  transform: PropTypes.string,
  truncate: PropTypes.bool,
  weight: PropTypes.string,
};

export default CardFooter;
