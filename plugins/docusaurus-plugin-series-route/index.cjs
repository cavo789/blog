/**
 * Docusaurus Plugin: series-route
 *
 * Purpose:
 * This plugin adds the routes for displaying articles by series slug under the
 * `/series/<slug>` URL pattern.
 *
 * Why:
 * Docusaurus by default does not support routes like `/series/<slug>`. This plugin
 * programmatically registers one route per series, each pointing to the
 * `SeriesArticlesPage` React component, which fetches and renders articles based on
 * the series slug taken from the URL.
 *
 * Why one route per series instead of a single `/series/:slug` (TODO 0092):
 * Docusaurus's `handleBrokenLinks` resolves links against the list of *registered*
 * routes, and a parameterized path matches nothing there. With a single `:slug` route
 * every `<Link href="/series/writing-better-bash-scripts">` was reported as broken,
 * which is why `onBrokenLinks` had to be set to "ignore" site-wide — and a genuinely
 * dead link then went out silently with it. Enumerating the real series at build time
 * makes those links resolvable, so link checking can be switched back on.
 *
 * Usage:
 * - Save this plugin as `plugins/docusaurus-plugin-series-route/index.cjs`
 * - Add the plugin to `docusaurus.config.js` plugins array.
 * - Create the React component at the specified path (`src/components/Blog/Series/SeriesArticlesPage.js`).
 *
 * This allows URLs like `/series/my-series-name` to display articles for that series.
 *
 * See readme.md for more details
 */

const path = require("path");
const { listSeriesSlugs } = require("../lib/blog-taxonomy.cjs");

module.exports = function (context) {
  return {
    name: "docusaurus-plugin-series-route",
    // Routes are enumerated from article frontmatter, so a new tag/series would
    // otherwise only get a route on the next dev-server restart. Watching the corpus
    // makes `yarn start` pick it up on save, like the parameterized route used to.
    getPathsToWatch() {
      return [path.join(context.siteDir, "blog", "**", "index.{md,mdx}")];
    },
    async contentLoaded({ actions }) {
      for (const slug of listSeriesSlugs(context.siteDir)) {
        actions.addRoute({
          path: `/series/${slug}`,
          component: "@site/src/components/Blog/Series/SeriesArticlesPage",
          exact: true,
        });
      }
    },
  };
};
