module.exports = function () {
  return {
    name: "docusaurus-plugin-tag-route",
    async contentLoaded({ actions }) {
      actions.addRoute({
        path: "/blog/tags/:tag",
        component: "@site/src/components/Blog/Tags/TagArticlesPage",
        exact: true,
      });
    },
  };
};
