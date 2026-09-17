/**
 * @fileoverview
 * Docusaurus Remark Plugin — remark-i18n-link-titles
 *
 * Keeps a translated article's links to OTHER articles labelled in the reader's language, as the
 * corpus gets translated around them.
 *
 * # The problem
 *
 * The translation contract deliberately leaves a link's text in English when that text is another
 * article's title: pointing a French reader at an English article under a French title would
 * promise something the destination does not deliver. So a French article legitimately contains:
 *
 *     <Link to="/blog/linux-history">Linux - Working with the history of your last fired actions</Link>
 *
 * That is correct on the day it is written — and wrong the day `linux-history` gets translated.
 * The destination now reads French, the URL already resolves to `/fr/blog/linux-history/` on its
 * own, but the label still announces an English article. Nothing will ever revisit it: the
 * referring article did not change, so its content hash is untouched, `translate` reports it up to
 * date and `translate:check` calls it FRESH. The staleness is invisible to every freshness signal
 * we have, because it lives in the relationship between two articles rather than inside either
 * one.
 *
 * # The fix
 *
 * Resolve the label at build time instead of storing it. For a translated article, a link whose
 * text is byte-identical to the English title of the article it points at is replaced with that
 * article's title in the current locale — when one exists.
 *
 * Nothing is written to disk, so nothing can go stale: translate a target article and the very
 * next build relabels every article that cites it. No command to remember, no API call, no cost.
 *
 * # Why byte-equality, and nothing cleverer
 *
 * Only a label that matches a real English title exactly is touched. Prose labels — "here's how
 * to set it up", "in an earlier article" — match no title and are left alone, which is the whole
 * point: they are the translator's words, not a citation. Any looser rule (fuzzy matching, "looks
 * like a title") would eventually rewrite a sentence, and a French article with a mangled
 * sentence is worse than one with an English link label.
 *
 * English articles are never touched: the plugin returns immediately for any file that is not
 * under `i18n/<locale>/docusaurus-plugin-content-blog/`.
 *
 * See TODO 0119, and the `source=` sibling problem in TODO 0122.
 */

const { visit } = require("unist-util-visit");
const {
  collectSourceFrontMatter,
  collectTranslatedFrontMatter,
} = require("../translations-manifest-plugin/index.cjs");

// i18n/<locale>/docusaurus-plugin-content-blog/<rest>
const I18N_BLOG_RE =
  /(^|[/\\])i18n[/\\]([^/\\]+)[/\\]docusaurus-plugin-content-blog(?:[/\\]|$)/;

// /blog/<slug> or /blog/<slug>/ — nothing deeper, and never a tag or archive route.
const BLOG_SLUG_RE = /^\/blog\/([^/#?]+)\/?$/;

/**
 * Read once per process, not once per file. A build compiles hundreds of articles and both
 * collectors walk the whole corpus from disk; doing that per file turned a 2-second step into
 * minutes in an early draft.
 *
 * The flip side: a long-lived `yarn start` keeps the corpus it saw at boot. A translation added
 * while it runs is not relabelled until the dev server restarts — which that translation needs
 * anyway, since Docusaurus does not register a new i18n file on hot reload either. A build is a
 * fresh process and is always current.
 */
let cache = null;

function corpus(projectRoot) {
  if (!cache) {
    cache = {
      english: collectSourceFrontMatter(projectRoot),
      translated: collectTranslatedFrontMatter(projectRoot),
    };
  }
  return cache;
}

/** The locale a translated file belongs to, or null for an English source. */
function localeOf(filePath) {
  const match = filePath.match(I18N_BLOG_RE);
  return match ? match[2] : null;
}

function slugOf(url) {
  if (typeof url !== "string") return null;
  const match = url.match(BLOG_SLUG_RE);
  return match ? match[1] : null;
}

/**
 * The single text child of a node, or null when the node holds anything else.
 *
 * A link wrapping emphasis, code or an image is not a bare title reference, and rewriting it
 * would drop that markup. Bailing out is the right answer: a citation is plain text.
 */
function soleText(node) {
  const children = node.children ?? [];
  if (children.length !== 1) return null;
  return children[0].type === "text" ? children[0] : null;
}

function remarkI18nLinkTitles() {
  return (tree, vfile) => {
    const locale = localeOf(vfile.path ?? "");
    if (!locale) return; // English source — the hot path, 257 files per build.

    const { english, translated } = corpus(process.cwd());
    const localeTitles = translated[locale];
    if (!localeTitles) return;

    const relabel = (node, url) => {
      const slug = slugOf(url);
      if (!slug) return;

      const sourceTitle = english[slug]?.title;
      const localeTitle = localeTitles[slug]?.title;

      // No translation for the target yet: the English label is still the honest one.
      if (!sourceTitle || !localeTitle) return;

      const text = soleText(node);
      if (!text || text.value.trim() !== sourceTitle.trim()) return;

      text.value = localeTitle;
    };

    // Markdown: [Some English Title](/blog/slug)
    visit(tree, "link", (node) => relabel(node, node.url));

    // MDX: <Link to="/blog/slug">Some English Title</Link>
    for (const nodeType of ["mdxJsxFlowElement", "mdxJsxTextElement"]) {
      visit(tree, nodeType, (node) => {
        if (node.name !== "Link") return;
        const to = (node.attributes ?? []).find((a) => a.name === "to");
        if (to) relabel(node, to.value);
      });
    }
  };
}

module.exports = remarkI18nLinkTitles;
