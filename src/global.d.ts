// @docusaurus/module-type-aliases declares *.svg, *.css and *.md, but not raster
// images — webpack's asset/resource loader turns these into a URL string at
// build time, same as *.css does. Needed as soon as a .tsx component imports
// one directly (see src/components/ScrollToTopButton/index.tsx).
declare module "*.png" {
  const src: string;
  export default src;
}

declare module "*.jpg" {
  const src: string;
  export default src;
}

declare module "*.jpeg" {
  const src: string;
  export default src;
}

declare module "*.gif" {
  const src: string;
  export default src;
}

declare module "*.webp" {
  const src: string;
  export default src;
}

// `require.context()` is a webpack build-time extension, not part of Node's `require` —
// `@types/webpack-env` would normally supply this, but it isn't installed (this is the only
// call site: Blog/utils/posts.ts, reading every blog article's front matter). Minimal shape
// covering only what that call site uses.
interface RequireContext {
  keys(): string[];
  (id: string): unknown;
}

declare namespace NodeJS {
  interface Require {
    context(
      directory: string,
      useSubdirectories?: boolean,
      regExp?: RegExp,
    ): RequireContext;
  }
}

// `/pagefind/pagefind.js` isn't a real module on disk at type-check time — it's a runtime-only
// asset `docusaurus-plugin-pagefind`'s `configureWebpack` externals rule substitutes for the
// real, baseUrl-aware URL at build time (see CommandPalette/utils.ts's `searchPagefind()` for
// why the import string must stay a literal). Declared so `tsc` doesn't try to resolve it as a
// file; the actual runtime shape is narrowed locally where it's imported.
declare module "/pagefind/pagefind.js" {
  const pagefind: unknown;
  export default pagefind;
}
