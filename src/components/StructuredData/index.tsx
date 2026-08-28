// Injects Schema.org BlogPosting JSON-LD into <head> for SEO rich results
import { useMemo, type JSX } from "react";
import Head from "@docusaurus/Head";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { useBaseUrlUtils } from "@docusaurus/useBaseUrl";

interface Props {
  metadata: {
    title?: string;
    frontMatter?: Record<string, unknown>;
    permalink?: string;
    date?: string;
    authors?: { name?: string; url?: string }[];
    tags?: { label?: string; permalink?: string }[];
  };
  assets?: {
    image?: string;
  };
}

function StructuredData({ metadata, assets }: Props): JSX.Element | null {
  const { siteConfig } = useDocusaurusContext();
  const { withBaseUrl } = useBaseUrlUtils();

  const jsonLd = useMemo(() => {
    if (!metadata) return null;

    const { title, frontMatter, permalink, date, authors, tags } = metadata;
    const siteUrl = siteConfig.url;
    // Co-located images (e.g. `./banner.jpg`) are bundler-resolved into
    // assets.image; frontMatter.image is only safe to use as-is when the
    // post points at a static path (e.g. /img/v2/...).
    const resolvedImage = assets?.image ?? (frontMatter?.image as string | undefined);

    // `updates` is a project-specific front matter field, so Docusaurus types it
    // as `unknown` — cast to the shape this component relies on.
    const updates = frontMatter?.updates as
      { date?: string; note?: string }[] | undefined;
    const mostRecentUpdate = updates?.length
      ? [...updates].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        )[0]
      : null;

    return {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: title,
      description: (frontMatter?.description as string) || "",
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
          url: `${siteUrl}/${siteConfig.themeConfig.image as string}`,
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
    <Head>
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Head>
  );
}

export default StructuredData;
