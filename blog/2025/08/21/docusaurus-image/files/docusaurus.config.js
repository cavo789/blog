const config = {
  // [ ... ]
  presets: [
    [
      'classic',
      ({
        blog: {
          // highlight-next-line
          beforeDefaultRemarkPlugins: [require('./plugins/remark-image-transformer')],
        },
        // [ ... ]
      }),
    ],
  ],
};

export default config;
