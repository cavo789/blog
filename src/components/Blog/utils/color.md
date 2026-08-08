# Color Utility

Converts a 6-digit hex color into an `rgba(...)` string, for turning an accent color into a
translucent CSS wash/glow.

## Usage

```js
import { hexToRgba } from '@site/src/components/Blog/utils/color';

hexToRgba('#38bdf8', 0.16); // "rgba(56, 189, 248, 0.16)"
hexToRgba('not-a-hex', 0.16); // null
```

## Used by

- `SeriesArticlesPage` — themed hero glow on `/series/:slug` pages, from the hand-picked
  `color` field in `src/data/series.js`.
- `BlogPostItem/Content` — themed hero glow on individual post pages, from the auto-extracted
  colors in `src/data/postColors.generated.js` (see `scripts/generate-post-colors.mjs`).

## Features

- Returns `null` for anything that isn't a plain `#rrggbb` hex, so callers can fall back to no
  wash instead of rendering `rgba(NaN, NaN, NaN, …)`.
