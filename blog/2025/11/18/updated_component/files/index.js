// [...]
import Updated from "@site/src/components/Blog/Updated";

export default function BlogPostContent({ children }) {
  // [...]
  const { metadata, isBlogPostPage } = useBlogPost();
  // [...]

  return (
    <div>
      // [...]
      {isBlogPostPage && (
        <>
          // [...]
          <Updated updates={metadata.frontMatter.updates} />
        </>
      )}
      // [...]
    </div>
  );
}
