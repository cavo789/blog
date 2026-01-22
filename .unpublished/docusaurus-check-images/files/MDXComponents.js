import MDXComponents from "@theme-original/MDXComponents";

export default {
  // Reusing the default mapping
  ...MDXComponents,

  // Override the img tag
  img: (props) => {
    const { loading, decoding, className, style, ...rest } = props;

    return (
      <img
        {...rest}
        // Force lazy loading if not specified
        loading={loading || "lazy"}
        // Decode asynchronously to avoid blocking the main thread
        decoding={decoding || "async"}
      />
    );
  },
};
