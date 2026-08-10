/**
 * Resolves a blog tag key (e.g. "ai") to its display label ("Artificial Intelligence (AI)")
 * as defined in blog/tags.yml — the single source of truth for tag labels, also used by
 * Docusaurus itself to build /blog/tags pages.
 */
import tagsYaml from "@site/blog/tags.yml";

export function getTagLabel(tagKey) {
  return tagsYaml?.[tagKey]?.label || tagKey;
}
