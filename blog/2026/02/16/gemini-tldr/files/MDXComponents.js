// [...]

// highlight-next-line
import TLDR from "@site/src/components/TLDR";

export default {
  // Reusing the default mapping
  ...MDXComponents,
  // [...]
  // highlight-next-line
  TLDR,
  // [...]
};
