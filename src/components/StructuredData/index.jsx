// Injects Schema.org BlogPosting JSON-LD into <head> for SEO rich results
import { useMemo } from "react";
import PropTypes from "prop-types";
import Head from "@docusaurus/Head";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { useBaseUrlUtils } from "@docusaurus/useBaseUrl";

function StructuredData({ metadata, assets }) {
  const { siteConfig } = useDocusaurusContext();
  const { withBaseUrl } = useBaseUrlUtils();

  const jsonLd = useMemo(() => {
    if (!metadata) return null;

    const { title, frontMatter, permalink, date, authors, tags } = metadata;
    const siteUrl = siteConfig.url;
    // Co-located images (e.g. `./banner.jpg`) are bundler-resolved into
    // assets.image; frontMatter.image is only safe to use as-is when the
    // post points at a static path (e.g. /img/v2/...).
    const resolvedImage = assets?.image ?? frontMatter?.image;

    const mostRecentUpdate = frontMatter?.updates?.length
      ? [...frontMatter.updates].sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        )[0]
      : null;

    return {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: title,
      description: frontMatter?.description || "",
      url: `${siteUrl}${permalink}`,
      datePublished: date,
      dateModified: mostRecentUpdate?.date || date,
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
      image: resolvedImage
        ? {
            "@type": "ImageObject",
            url: withBaseUrl(resolvedImage, { absolute: true }),
          }
        : undefined,
    };
  }, [metadata, assets, siteConfig, withBaseUrl]);

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
      updates: PropTypes.arrayOf(
        PropTypes.shape({
          date: PropTypes.string,
          note: PropTypes.string,
        })
      ),
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
  assets: PropTypes.shape({
    image: PropTypes.string,
  }),
};

export default StructuredData;
