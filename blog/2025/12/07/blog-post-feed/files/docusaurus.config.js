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
        "./plugins/blog-feed-plugin/index.js",
        { maxItems: 20 },
    ],
],
