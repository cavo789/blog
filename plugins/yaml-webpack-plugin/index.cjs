// Lets application code `import` .yml/.yaml files directly (e.g. blog/tags.yml), parsed to a
// plain JS object at build time. Without this rule, webpack has no loader for YAML and such an
// import fails with "You may need an appropriate loader".
const yaml = require("js-yaml");

module.exports = function yamlWebpackPlugin() {
  return {
    name: "yaml-webpack-plugin",
    configureWebpack() {
      return {
        module: {
          rules: [
            {
              test: /\.ya?ml$/,
              type: "json",
              parser: { parse: yaml.load },
            },
          ],
        },
      };
    },
  };
};
