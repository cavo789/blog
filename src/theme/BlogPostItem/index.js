import { useBlogPost } from "@docusaurus/plugin-content-blog/client";
import BlogPostItemContainer from "@theme/BlogPostItem/Container";
import BlogPostItemContent from "@theme/BlogPostItem/Content";
import BlogPostItemFooter from "@theme/BlogPostItem/Footer";
import BlogPostItemHeader from "@theme/BlogPostItem/Header";
import ScrollToTopButton from "@site/src/components/ScrollToTopButton";
import StructuredData from "@site/src/components/StructuredData";
import clsx from "clsx";

// Our posts components
import RelatedPosts from "@site/src/components/Blog/RelatedPosts/index.js";

// Our Bluesky component
import Bluesky from "@site/src/components/Bluesky/index.js";

// apply a bottom margin in list view
function useContainerClassName() {
  const { isBlogPostPage } = useBlogPost();
  return !isBlogPostPage ? "margin-bottom--xl" : undefined;
}
export default function BlogPostItem({ children, className }) {
  // We need to retrieve the isBlogPostPage flag
  const { metadata, isBlogPostPage } = useBlogPost();
  const containerClassName = useContainerClassName();

  return (
    <>
      {isBlogPostPage && <StructuredData metadata={metadata} />}
      <BlogPostItemContainer className={clsx(containerClassName, className)}>
        <BlogPostItemHeader />
        <BlogPostItemContent>{children}</BlogPostItemContent>
        <BlogPostItemFooter />

        {/* Only display our RelatedPosts and Bluesky components on the post page; not the blog view */}
        {isBlogPostPage && (
          <>
            <Bluesky metadata={metadata} />
            <RelatedPosts count="6" description="false" />
          </>
        )}
        <ScrollToTopButton />
      </BlogPostItemContainer>
    </>
  );
}
