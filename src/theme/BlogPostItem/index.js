import AIIcon from "@site/src/components/Blog/AIIcon";
import CopyAsMarkdown from "@site/src/components/CopyAsMarkdown";
import PropTypes from "prop-types";
import { useBlogPost } from "@docusaurus/plugin-content-blog/client";
import BlogPostItemContainer from "@theme/BlogPostItem/Container";
import BlogPostItemContent from "@theme/BlogPostItem/Content";
import BlogPostItemFooter from "@theme/BlogPostItem/Footer";
import BlogPostItemHeader from "@theme/BlogPostItem/Header";
import ScrollToTopButton from "@site/src/components/ScrollToTopButton";
import Reaction from "@site/src/components/Reaction";
import TriedIt from "@site/src/components/TriedIt";
import TypoReport from "@site/src/components/TypoReport";
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
  const { frontMatter } = metadata;
  const containerClassName = useContainerClassName();
  const aiIcon = frontMatter.ai_assisted && isBlogPostPage ? <AIIcon /> : null;
  // Same reasoning as aiIcon: the mirror only exists for the article the
  // reader is actually on, never for a card in a list view.
  const copyAsMarkdown = isBlogPostPage ? <CopyAsMarkdown metadata={metadata} /> : null;

  return (
    <>
      <BlogPostItemContainer className={clsx(containerClassName, className)}>
        <BlogPostItemHeader aiIcon={aiIcon} copyAsMarkdown={copyAsMarkdown} />
        <BlogPostItemContent>{children}</BlogPostItemContent>
        <BlogPostItemFooter />

        {/* Only display our RelatedPosts and Bluesky components on the post page; not the blog view */}
        {isBlogPostPage && (
          <>
            {/* Readers who reach the end of an article should meet the next one
                to read before the reaction, comment and typo report blocks.
                Buried under those widgets, these links were never seen. */}
            <RelatedPosts count={6} description={true} />
            <TypoReport metadata={metadata} />
            <Reaction metadata={metadata} />
            {frontMatter.tried_it !== false && <TriedIt metadata={metadata} />}
            <Bluesky metadata={metadata} />
          </>
        )}
        <ScrollToTopButton />
      </BlogPostItemContainer>
    </>
  );
}
BlogPostItem.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};
