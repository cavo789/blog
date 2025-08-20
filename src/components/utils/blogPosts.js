const blogPosts = require.context("../../../blog", true, /\.mdx?$/);

export function getBlogMetadata() {
  return blogPosts
    .keys()
    .map((key) => {
      const post = blogPosts(key);

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
        draft: post.frontMatter.draft || false,
        unlisted: post.frontMatter.unlisted || false,
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
