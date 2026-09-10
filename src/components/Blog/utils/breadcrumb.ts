import { createSlug } from "@site/src/components/Blog/utils/slug";
import { getTagLabel } from "@site/src/data/tags";

/**
 * breadcrumb.ts
 *
 * Single source of truth for an article's breadcrumb trail.
 *
 * Both the visible trail (`src/components/Blog/Breadcrumb`) and the
 * `BreadcrumbList` JSON-LD graph (`src/components/StructuredData`) are derived
 * from this one function on purpose: a visible breadcrumb that disagrees with
 * the structured data it claims to describe is worse, for a crawler, than no
 * structured data at all.
 *
 * Trail shape: Home > mainTag > series > article title.
 * The two middle levels are optional and are simply skipped when the post
 * carries no `mainTag` (1 post out of 255) or no `series` (79 out of 255).
 *
 * @example
 * buildBreadcrumbTrail({ title: "Lazydocker", mainTag: "docker" });
 * // [
 * //   { label: "Home", href: "/" },
 * //   { label: "Docker", href: "/blog/tags/docker" },
 * //   { label: "Lazydocker" },
 * // ]
 */

export interface BreadcrumbItem {
  label: string;
  /** Absent on the last item only: the current page never links to itself. */
  href?: string;
}

export interface BreadcrumbInput {
  /** The article title — rendered as the final, non-clickable level. */
  title?: string;
  /** `mainTag` front matter value, i.e. a key of blog/tags.yml (e.g. "docker"). */
  mainTag?: string;
  /** `series` front matter value, i.e. the series display name. */
  series?: string;
}

export function buildBreadcrumbTrail({
  title,
  mainTag,
  series,
}: BreadcrumbInput): BreadcrumbItem[] {
  const trail: BreadcrumbItem[] = [{ label: "Home", href: "/" }];

  // Same link/label pair as PostCard: `/blog/tags/<createSlug(mainTag)>` is the
  // route `plugins/lib/blog-taxonomy.cjs` enumerates from this very front matter
  // field, so the link can never be dead under `onBrokenLinks: "throw"`, and
  // getTagLabel() resolves the key to its blog/tags.yml display label.
  const tagSlug = mainTag ? createSlug(mainTag) : "";
  if (mainTag && tagSlug) {
    trail.push({ label: getTagLabel(mainTag), href: `/blog/tags/${tagSlug}` });
  }

  // Same reasoning for the series level: listSeriesSlugs() registers one route
  // per series found in front matter, drafts included.
  const seriesSlug = series ? createSlug(series) : "";
  if (series && seriesSlug) {
    trail.push({ label: series, href: `/series/${seriesSlug}` });
  }

  if (title) {
    trail.push({ label: title });
  }

  return trail;
}
