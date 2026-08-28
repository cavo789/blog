/**
 * Webpack loader that turns a Markdown/MDX file into a tiny JS module exposing
 * nothing but its YAML front matter:
 *
 *     module.exports = { frontMatter: { title: "…", date: new Date("…"), … } };
 *
 * Why this exists
 * ---------------
 * `src/components/Blog/utils/posts.ts` needs the front matter of every article
 * under `blog/`. It gets it with `require.context("…/blog", true, /\.mdx?$/)`.
 *
 * Without this loader, that context makes Webpack compile *every* file under
 * `blog/` through the rule installed by `@docusaurus/plugin-content-blog`,
 * whose `createAssets()` hook throws
 *
 *     Error: Blog post not found for filePath=…
 *
 * for any file the blog plugin did not turn into a post — which is exactly what
 * a `draft: true` article is during a production build. Prefixing the context
 * request with `!!` + this loader disables the configured rules for those
 * modules, so drafts can live under `blog/` without breaking `yarn build`.
 *
 * It is also much cheaper: reading front matter no longer requires compiling
 * 248 articles to JSX just to throw the body away.
 *
 * The serializer mirrors what `@docusaurus/mdx-loader` produces, so consumers
 * keep seeing real `Date` objects for `date` / `review_date` rather than
 * strings.
 */

const frontMatter = require("front-matter");

/**
 * Serializes a front matter value to JavaScript source code.
 *
 * `JSON.stringify` alone is not enough: YAML dates are parsed into `Date`
 * instances and must stay `Date` instances on the other side.
 *
 * @param {unknown} value Any value coming out of the YAML parser.
 * @returns {string} JavaScript source code evaluating to that value.
 */
function serialize(value) {
  if (value instanceof Date) {
    return `new Date(${JSON.stringify(value.toISOString())})`;
  }

  if (Array.isArray(value)) {
    return `[${value.map(serialize).join(",")}]`;
  }

  if (value !== null && typeof value === "object") {
    const entries = Object.entries(value)
      .filter(([, item]) => item !== undefined)
      .map(([key, item]) => `${JSON.stringify(key)}:${serialize(item)}`);

    return `{${entries.join(",")}}`;
  }

  return JSON.stringify(value === undefined ? null : value);
}

module.exports = function frontMatterLoader(source) {
  const { attributes } = frontMatter(source);

  return `module.exports = { frontMatter: ${serialize(attributes)} };`;
};
