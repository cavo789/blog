// existing imports…
import TypoReport from "@site/src/components/TypoReport";

export default function BlogPostItem({ children, className }) {
  const { metadata, isBlogPostPage } = useBlogPost();
  // …

  return (
    <>
      <BlogPostItemContainer className={clsx(containerClassName, className)}>
        <BlogPostItemHeader />
        <BlogPostItemContent>{children}</BlogPostItemContent>
        <BlogPostItemFooter />

        {isBlogPostPage && (
          <TypoReport metadata={metadata} />
        )}
      </BlogPostItemContainer>
    </>
  );
}
