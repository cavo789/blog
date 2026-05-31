// Injects Schema.org BlogPosting JSON-LD into <head> for SEO rich results
import { useMemo } from "react";
import PropTypes from "prop-types";
import Head from "@docusaurus/Head";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

function StructuredData({ metadata }) {
  const { siteConfig } = useDocusaurusContext();

  const jsonLd = useMemo(() => {
    if (!metadata) return null;

    const { title, frontMatter, permalink, date, authors, tags } = metadata;
    const siteUrl = siteConfig.url;

    return {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: title,
      description: frontMatter?.description || "",
      url: `${siteUrl}${permalink}`,
      datePublished: date,
      dateModified: frontMatter?.lastUpdated || date,
      keywords: tags?.length ? tags.map((t) => t.label).join(", ") : undefined,
      author: authors?.[0]?.name
        ? {
            "@type": "Person",
            name: authors[0].name,
            url: authors[0].url ?? `${siteUrl}/about`,
          }
        : undefined,
      publisher: {
        "@type": "Organization",
        name: siteConfig.title,
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/${siteConfig.themeConfig.image}`,
        },
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `${siteUrl}${permalink}`,
      },
      image: frontMatter?.image
        ? {
            "@type": "ImageObject",
            url: `${siteUrl}${frontMatter.image}`,
          }
        : undefined,
    };
  }, [metadata, siteConfig]);

  if (!jsonLd) return null;

  return (
    <Head
      script={[
        {
          type: "application/ld+json",
          innerHTML: JSON.stringify(jsonLd),
        },
      ]}
    />
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
        url: PropTypes.string,
      })
    ),
    tags: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string,
        permalink: PropTypes.string,
      })
    ),
  }).isRequired,
};

export default StructuredData;
