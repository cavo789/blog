// [...]
presets: [
    [
      "classic",
      ({
        blog: {
          // ...
          feedOptions: {
            type: ["atom"],
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
