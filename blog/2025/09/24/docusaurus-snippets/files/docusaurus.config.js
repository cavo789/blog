// highlight-next-line
import remarkSnippetLoader from "./plugins/remark-snippet-loader/index.cjs";

const config = {
  // [ ... ]
  presets: [
    [
      "classic",
      {
        // [ ... ]
        blog: {
          beforeDefaultRemarkPlugins: [
            // [ ... ]
            // highlight-next-line
            remarkSnippetLoader,
          ],
        },
        // [ ... ]
      },
    ],
  ],
};

export default config;
