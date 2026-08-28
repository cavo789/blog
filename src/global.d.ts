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
