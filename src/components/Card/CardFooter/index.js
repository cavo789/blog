import React,  { CSSProperties } from 'react';
import styles from '../styles.module.css';

import clsx from 'clsx';
const CardFooter = ({
  className,
  style,
  children,
  textAlign,
  variant,
  italic = false ,
  noDecoration = false,
  transform,
  truncate = false,
  weight,
}) => {
  const text = textAlign ? `text--${textAlign}` :'';
  const textColor = variant ? `text--${variant}` : '';
  const textItalic = italic ? 'text--italic' : '';
  const textDecoration = noDecoration ? 'text-no-decoration' : '';
  const textType = transform ? `text--${transform}` : '';
  const textTruncate = truncate ? styles.truncate : '';
  const textWeight = weight ? `text--${weight}` : '';
  return (
    <div
      className={clsx(
        'card__footer',
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
}
export default CardFooter;