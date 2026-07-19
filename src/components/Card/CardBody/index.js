import PropTypes from "prop-types";
import clsx from "clsx";
import styles from "../styles.module.css";
import { buildTextClasses } from "../utils";
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
        "card__body",
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

CardBody.propTypes = {
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

export default CardBody;
