import type { CSSProperties, JSX, ReactNode } from "react";
import clsx from "clsx"; // clsx helps manage conditional className names in a clean and concise manner.

interface Props {
  /** Custom classes for the container card */
  className?: string;
  /** Custom styles for the container card */
  style?: CSSProperties;
  /** Content to be included within the card */
  children?: ReactNode;
  /** Shadow under the card. Expected values: low (lw), medium (md), tall (tl) */
  shadow?: "lw" | "md" | "tl";
}

const Card = ({ className, style, children, shadow }: Props): JSX.Element => {
  const cardShadow = shadow ? `item shadow--${shadow}` : "";
  return (
    <div className={clsx("card", className, cardShadow)} style={style}>
      {children}
    </div>
  );
};

export default Card;
