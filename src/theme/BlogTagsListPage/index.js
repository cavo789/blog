import clsx from "clsx";
import {
  PageMetadata,
  HtmlClassNameProvider,
  ThemeClassNames,
  translateTagsPageTitle,
} from "@docusaurus/theme-common";
import ScrollToTopButton from "@site/src/components/ScrollToTopButton";
import BlogLayout from "@theme/BlogLayout";
import TagsListByLetter from "@theme/TagsListByLetter";
import SearchMetadata from "@theme/SearchMetadata";
import Heading from "@theme/Heading";

/**
 * Custom BlogTagsListPage component.
 *
 * This file is needed to fix a bug where tag permalinks are generated with an incorrect
 * double path segment (e.g., '/blog/tags/tags/'). It normalizes these URLs to '/blog/tags/'.
 */
export default function BlogTagsListPage({ tags, sidebar }) {
  const title = translateTagsPageTitle();

  const correctedTags = Object.keys(tags).reduce((acc, key) => {
    const tag = tags[key];
    acc[key] = {
      ...tag,
      permalink: tag.permalink.replace("/blog/tags/tags/", "/blog/tags/"),
    };
    return acc;
  }, {});

  return (
    <HtmlClassNameProvider
      className={clsx(
        ThemeClassNames.wrapper.blogPages,
        ThemeClassNames.page.blogTagsListPage
      )}
    >
      <PageMetadata title={title} />
      <SearchMetadata tag="blog_tags_list" />
      <BlogLayout sidebar={sidebar}>
        <Heading as="h1">{title}</Heading>
        <TagsListByLetter tags={correctedTags} />
      </BlogLayout>
      <ScrollToTopButton />
    </HtmlClassNameProvider>
  );
}
