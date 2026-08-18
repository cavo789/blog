/**
 * Docusaurus Plugin: tag-route
 *
 * Registers the `/blog/tags/<slug>` pages rendered by `TagArticlesPage`.
 *
 * Why one route per tag instead of a single `/blog/tags/:tag` (TODO 0092):
 * Docusaurus's `handleBrokenLinks` resolves links against the list of *registered*
 * routes, and a parameterized path matches nothing there. With a single `:tag` route
 * every `<Link to="/blog/tags/docker">` in the corpus was reported as broken, which is
 * why `onBrokenLinks` had to be set to "ignore" site-wide — and a genuinely dead link
 * then went out silently with it. Enumerating the real tags at build time makes those
 * links resolvable, so link checking can be switched back on.
 *
 * Note this is *not* the blog plugin's own tag listing: that one lives at
 * `/blog/tags/tags/<slug>` (the doubled segment comes from blog/tags.yml's `permalink`
 * values being prefixed with the `/blog/tags` base), so the two never collide.
 */

const path = require("path");
const { listTagSlugs } = require("../lib/blog-taxonomy.cjs");

module.exports = function (context) {
  return {
    name: "docusaurus-plugin-tag-route",
    // Routes are enumerated from article frontmatter, so a new tag/series would
    // otherwise only get a route on the next dev-server restart. Watching the corpus
    // makes `yarn start` pick it up on save, like the parameterized route used to.
    getPathsToWatch() {
      return [path.join(context.siteDir, "blog", "**", "index.{md,mdx}")];
    },
    async contentLoaded({ actions }) {
      for (const slug of listTagSlugs(context.siteDir)) {
        actions.addRoute({
          path: `/blog/tags/${slug}`,
          component: "@site/src/components/Blog/Tags/TagArticlesPage",
          exact: true,
        });
      }
    },
  };
};
