// src/components/utils/blog.js
// const blogPosts = require.context("../../../blog", true, /\.mdx?$/);

// Negative lookahead to exclude `.unpublished` subfolder
const blogPosts = require.context(
  "../../../blog",
  true,
  /^(?!.*unpublished).*\.mdx?$/
);

export function getBlogMetadata() {
  return blogPosts
    .keys()
    .map((key) => {
      const post = blogPosts(key);
      if (post.frontMatter.draft || post.frontMatter.unlisted) return null;

      const dir = key.replace(/\/index\.mdx?$/, "").replace(/^\.\//, "");

      let permalink;
      if (post.frontMatter.slug) {
        permalink = post.frontMatter.slug.startsWith("/")
          ? post.frontMatter.slug
          : `/blog/${post.frontMatter.slug.replace(/^\//, "")}`;
      } else {
        permalink = `/blog/${dir}/`;
      }

      let imageUrl = post.frontMatter.image;
      if (imageUrl && imageUrl.startsWith("./")) {
        imageUrl = `/blog/${dir}/${imageUrl.replace("./", "")}`;
      }

      return {
        title: post.frontMatter.title,
        description: post.frontMatter.description,
        image: imageUrl,
        permalink,
        tags: post.frontMatter.tags || [],
        mainTag: post.frontMatter.mainTag || null,
        authors: post.frontMatter.authors || [],
        date: post.frontMatter.date,
        serie: post.frontMatter.serie || null,
      };
    })
    .filter(Boolean);
}
