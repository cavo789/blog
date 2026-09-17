import AIIcon from "@site/src/components/Blog/AIIcon";
import ArticleActions from "@site/src/components/Blog/ArticleActions";
import PropTypes from "prop-types";
import { useBlogPost } from "@docusaurus/plugin-content-blog/client";
import BlogPostItemContainer from "@theme/BlogPostItem/Container";
import BlogPostItemContent from "@theme/BlogPostItem/Content";
import BlogPostItemFooter from "@theme/BlogPostItem/Footer";
import BlogPostItemHeader from "@theme/BlogPostItem/Header";
import Reaction from "@site/src/components/Reaction";
import TriedIt from "@site/src/components/TriedIt";
import TypoReport from "@site/src/components/TypoReport";
import clsx from "clsx";

// Our posts components
import RelatedPosts from "@site/src/components/Blog/RelatedPosts";

// Locale awareness — both render nothing on the English site unless a translation exists.
import TranslationNotice from "@site/src/components/Blog/TranslationNotice";

// Our Bluesky component
import Bluesky from "@site/src/components/Bluesky";

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
  // Same reasoning as aiIcon: these actions only make sense for the article the
  // reader is actually on, never for a card in a list view.
  const actions = isBlogPostPage ? <ArticleActions metadata={metadata} /> : null;

  return (
    <>
      <BlogPostItemContainer className={clsx(containerClassName, className)}>
        <BlogPostItemHeader aiIcon={aiIcon} actions={actions} />
        {/* Above the content, never inside the translated Markdown file: the banner must not be
            something the translator can mangle, and the flag must be reachable before the
            reader has scrolled through prose they may not want to read. */}
        {/* The flag badge used to sit here too. Removed on 2026-09-16: the sentence below says
            the same thing in words, and a badge that duplicates it is noise at the very place a
            reader is trying to start the article. */}
        {isBlogPostPage && <TranslationNotice permalink={metadata.permalink} />}
        <BlogPostItemContent>{children}</BlogPostItemContent>
        <BlogPostItemFooter />

        {/* Only display our RelatedPosts and Bluesky components on the post page; not the blog view */}
        {isBlogPostPage && (
          <>
            {/* Bluesky comes first: it and RelatedPosts are both exit points
                (off-site vs. another post), and whichever renders first wins
                the click of a reader who just finished and is ready to act.
                Bluesky engagement is the current priority ask. */}
            <Bluesky metadata={metadata} />
            {/* Readers who reach the end of an article should meet the next one
                to read before the reaction, comment and typo report blocks.
                Buried under those widgets, these links were never seen. */}
            <RelatedPosts count={6} description={true} />
            <TypoReport metadata={metadata} />
            <Reaction metadata={metadata} />
            {frontMatter.tried_it !== false && <TriedIt metadata={metadata} />}
          </>
        )}
      </BlogPostItemContainer>
    </>
  );
}
BlogPostItem.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};
