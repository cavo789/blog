# Slug Utility

This utility provides a function to convert any string into a URL-friendly slug. Useful for generating clean, readable URLs from titles, headings, or labels.

## Usage

```js
import { createSlug } from '@site/src/components/Blog/utils/slug';

const title = "Café au lait & croissants!";
const slug = createSlug(title); // Output: "cafe-au-lait-croissants"
```

## Features

* Converts to lowercase
* Removes accents and diacritics
* Strips special characters
* Replaces spaces with hyphens
* Collapses multiple hyphens
* Trims leading/trailing hyphens

## Location

Place this file in: `src/components/Blog/utils/slug.js`

## 📄 License

MIT — free to use, modify, and contribute.

## 💬 Authors

[Valentin Chevoleau](https://github.com/Juniors017) and [Christophe Avonture](https://www.avonture.be).
