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
// `@types/webpack-env` would normally supply this, but it isn't installed. Two call sites:
// Blog/utils/posts.ts (every blog article's front matter) and BlogGraph/meerkats.ts (the
// meerkat sticker folder). Minimal shape covering only what they use.
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
      // "weak" bundles nothing and leaves only `keys()` usable — what BlogGraph/meerkats.ts
      // wants: the folder's file names at build time, without webpack inlining 68 images
      // into the page's chunk. "sync" is webpack's default and what posts.ts relies on.
      mode?: "sync" | "eager" | "weak" | "lazy" | "lazy-once",
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

// `*.yml` is not a path here: `plugins/yaml-webpack-plugin` registers a webpack rule with
// `type: "json"` and `js-yaml` as the parser, so an import yields the parsed document.
// @docusaurus/module-type-aliases doesn't declare it. Call sites: src/data/tags.js and
// src/components/Blog/utils/tagsI18n.ts, both reading a `tags.yml`.
declare module "*.yml" {
  const data: Record<string, unknown>;
  export default data;
}
