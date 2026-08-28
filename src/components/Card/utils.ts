/**
 * Builds the clsx-ready text utility classes shared by CardHeader, CardBody and CardFooter.
 */

export interface CardTextOptions {
  textAlign?: "left" | "center" | "right" | "justify";
  variant?: string;
  italic?: boolean;
  noDecoration?: boolean;
  transform?: string;
  truncate?: boolean;
  weight?: string;
}

export function buildTextClasses(
  {
    textAlign,
    variant,
    italic = false,
    noDecoration = false,
    transform,
    truncate = false,
    weight,
  }: CardTextOptions,
  truncateClass: string,
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
