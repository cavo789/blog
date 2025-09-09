  import React,  { CSSProperties } from 'react'; // CSSProperties allows inline styling with better type checking.
  import clsx from 'clsx'; // clsx helps manage conditional className names in a clean and concise manner.
  import styles from '../styles.module.css';

  const CardHeader = ({
    className, // classNamees for the container card
    style, // Custom styles for the container card
    children, // Content to be included within the card
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
          'card__header',
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
  export default CardHeader;