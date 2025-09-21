/**
 * StructuredData Component for Docusaurus Blog
 *
 * Injects JSON-LD structured data into the <head> of blog post pages
 * using the Schema.org BlogPosting format. This improves SEO and enables
 * rich results in search engines like Google.
 *
 * - Dynamically builds metadata from blog post frontMatter and site config
 * - Uses siteConfig.url and themeConfig.image for absolute URLs
 * - Injects via <Head> using script prop (recommended for Docusaurus)
 * - Optional debug block available for visual inspection
 *
 * Usage:
 *   <StructuredData metadata={metadata} />
 *
 * Expected to be used inside BlogPostPage or BlogPostItem, where metadata is available.
 *
 * Location: src/components/StructuredData/index.jsx
 */

import PropTypes from 'prop-types';
import Head from '@docusaurus/Head';
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

function StructuredData({ metadata }) {
  if (!metadata) return null;

  const {
    title,
    frontMatter,
    permalink,
    date,
    authors,
  } = metadata;

  const { siteConfig } = useDocusaurusContext();
  const siteUrl = siteConfig.url;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": title,
    "description": frontMatter?.description || '',
    "datePublished": date,
    "dateModified": frontMatter?.lastUpdated || date,
    "author": authors?.[0]?.name
      ? {
          "@type": "Person",
          "name": authors[0].name,
          "url": `${siteUrl}/about`
        }
      : undefined,
    "publisher": {
      "@type": "Organization",
      "name": siteConfig.title,
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/${siteConfig.themeConfig.image}`,
      },
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${siteUrl}${permalink}`,
    },
    "image": frontMatter?.image
      ? `${siteUrl}${frontMatter.image}`
      : undefined,
  };

  return (
    <>
      <Head
        script={[
          {
            type: 'application/ld+json',
            innerHTML: JSON.stringify(jsonLd),
          },
        ]}
      />
      {/* Debug block (optional) */}
      {/* <div style={{ background: '#f0f0f0', padding: '1rem', marginTop: '2rem' }}>
        <h4>🧪 Structured Data Debug</h4>
        <pre>{JSON.stringify(jsonLd, null, 2)}</pre>
      </div> */}
    </>
  );
}

StructuredData.propTypes = {
  metadata: PropTypes.shape({
    title: PropTypes.string,
    frontMatter: PropTypes.shape({
      description: PropTypes.string,
      lastUpdated: PropTypes.string,
      image: PropTypes.string,
    }),
    permalink: PropTypes.string,
    date: PropTypes.string,
    authors: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
      })
    ),
  }).isRequired,
};

export default StructuredData;
