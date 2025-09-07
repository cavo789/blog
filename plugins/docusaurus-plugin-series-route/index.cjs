/**
 * Docusaurus Plugin: series-route
 *
 * Purpose:
 * This plugin adds a dynamic route to the Docusaurus app for displaying articles
 * by series slug under the `/series/:slug` URL pattern.
 *
 * Why:
 * Docusaurus by default does not support dynamic routes like `/series/:slug`.
 * This plugin programmatically registers such a route pointing to the `SeriesArticlesPage`
 * React component, which fetches and renders articles based on the series slug.
 *
 * Usage:
 * - Save this plugin as `plugins/docusaurus-plugin-series-route/index.mjs`
 * - Add the plugin to `docusaurus.config.js` plugins array.
 * - Create the React component at the specified path (`src/components/Blog/Series/SeriesArticlesPage.js`).
 *
 * This allows URLs like `/series/my-series-name` to display articles for that series.
 *
 * See readme.md for more details
 */

module.exports = function () {
  return {
    name: "docusaurus-plugin-series-route",
    async contentLoaded({ actions }) {
      actions.addRoute({
        path: "/series/:slug", // Dynamic URL path capturing the series slug
        component: "@site/src/components/Blog/Series/SeriesArticlesPage",
        exact: true,
      });
    },
  };
};
