// highlight-next-line
import remarkReplaceWords from "./plugins/remark-replace-terms";

const config = {
  // [ ... ]
  presets: [
    [
      'classic',
      ({
        // [ ... ]
        blog: {
          beforeDefaultRemarkPlugins: [
            // [ ... ]
            // highlight-next-line
            remarkReplaceWords
          ],
        },
        // [ ... ]
      }),
    ],
  ],
};

export default config;
