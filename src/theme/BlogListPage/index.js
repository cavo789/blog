import React from 'react';
import clsx from 'clsx';
import { HtmlClassNameProvider, ThemeClassNames, PageMetadata } from '@docusaurus/theme-common';
import BlogListPaginator from '@theme/BlogListPaginator';
import SearchMetadata from '@theme/SearchMetadata';
import Layout from '@theme/Layout';
import { formatPostDate } from '@site/src/components/Blog/utils/date';
import styles from './styles.module.css';

function resolveImageUrl(frontMatterImage, permalink) {
  if (!frontMatterImage) return null;
  if (!frontMatterImage.startsWith('./')) return frontMatterImage;
  const slug = permalink.replace(/^\/blog\//, '').replace(/\/$/, '');
  return `/blog/${slug}/${frontMatterImage.replace('./', '')}`;
}

function BlogCard({ post }) {
  const dateStr = formatPostDate(post.date, 'en');
  return (
    <a href={post.permalink} className={styles.cardLink}>
      <div className={styles.card}>
        {post.image && (
          <img
            src={post.image}
            alt={post.title}
            loading="lazy"
            className={styles.cardImage}
          />
        )}
        <div className={styles.cardBody}>
          <h2 className={styles.cardTitle}>{post.title}</h2>
          {post.description && (
            <p className={styles.cardDescription}>{post.description}</p>
          )}
          {dateStr && (
            <time dateTime={post.date} className={styles.cardDate}>
              {dateStr}
            </time>
          )}
        </div>
      </div>
    </a>
  );
}

function BlogListPageMetadata({ metadata }) {
  const { blogDescription, blogTitle } = metadata;
  return (
    <>
      <PageMetadata title={blogTitle} description={blogDescription} />
      <SearchMetadata tag="blog_posts_list" />
    </>
  );
}

function BlogListPageContent({ metadata, items }) {
  const posts = items.map(({ content: { metadata: m } }) => ({
    id: m.permalink,
    permalink: m.permalink,
    title: m.title,
    description: m.description,
    date: m.date,
    image: resolveImageUrl(m.frontMatter?.image, m.permalink),
  }));

  return (
    <Layout>
      <main className={clsx('container', styles.blogListPage)}>
        <h1 className={styles.pageTitle}>
          All posts
          <span className={styles.postCount}>{metadata.totalCount}</span>
        </h1>
        <div className={styles.cardsGrid}>
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
        <BlogListPaginator metadata={metadata} />
      </main>
    </Layout>
  );
}

export default function BlogListPage(props) {
  return (
    <HtmlClassNameProvider
      className={clsx(
        ThemeClassNames.wrapper.blogPages,
        ThemeClassNames.page.blogListPage
      )}
    >
      <BlogListPageMetadata {...props} />
      <BlogListPageContent {...props} />
    </HtmlClassNameProvider>
  );
}
