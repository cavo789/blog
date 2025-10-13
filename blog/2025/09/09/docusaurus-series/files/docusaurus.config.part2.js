// [...]
import pluginSeriesRoute from "./plugins/docusaurus-plugin-series-route/index.cjs"

const config = {
  // [...]

  // WE SHOULD IGNORE BROKEN LINKS because Docusaurus’s link checker doesn't
  // recognize dynamic routes created via plugins; and we're using at least one
  // i.e. "plugins/docusaurus-plugin-series-route/index.cjs".
  // If we don't ignore broken links, Docusaurus will always throw an error during build
  // time.
  onBrokenLinks: "ignore",
  // [...]
  plugins: [
    // [...]
    [pluginSeriesRoute, {}],
  ],
  // [...]
};

export default config;
