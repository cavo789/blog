import pluginSeriesRoute from "./plugins/docusaurus-plugin-series-route/index.cjs"
// [...]
plugins: [
    // [...]
    [
    "./plugins/ascii-injector/index.mjs",
    { bannerPath: "src/data/banner.txt" },
],
],
