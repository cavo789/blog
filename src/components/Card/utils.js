/**
 * Builds the clsx-ready text utility classes shared by CardHeader, CardBody and CardFooter.
 */
export function buildTextClasses(
  {
    textAlign,
    variant,
    italic = false,
    noDecoration = false,
    transform,
    truncate = false,
    weight,
  },
  truncateClass,
) {
  return {
    text: textAlign ? `text--${textAlign}` : "",
    textColor: variant ? `text--${variant}` : "",
    textItalic: italic ? "text--italic" : "",
    textDecoration: noDecoration ? "text-no-decoration" : "",
    textType: transform ? `text--${transform}` : "",
    textTruncate: truncate ? truncateClass : "",
    textWeight: weight ? `text--${weight}` : "",
  };
}
