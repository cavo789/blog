// [...]
presets: [
    [
      "classic",
      ({
        blog: {
          // ...
          feedOptions: {
            type: null,
          },
      }),
    ],
],
plugins: [
    // [...]
    [
        "./plugins/blog-feed-plugin/index.mjs",
        { maxItems: 20 },
    ],
],
