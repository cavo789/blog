/**
 * @fileoverview
 * Docusaurus Remark Plugin — remark-i18n-assets
 *
 * Makes a translated article find the co-located assets of its English source.
 *
 * # The problem
 *
 * A translation lives at `i18n/<locale>/docusaurus-plugin-content-blog/<rel>/index.md`, but its
 * `files/` and `images/` folders stay next to the English article, under `blog/<rel>/`. Every
 * `./`-relative reference in the translated file therefore resolves into a directory that does
 * not exist, and the build fails — twice over, through two unrelated resolvers:
 *
 *   - `<Snippet source="./files/x">` → plugins/remark-snippet-loader, which resolves against
 *     `path.dirname(vfile.path)`;
 *   - `![](./images/x.webp)` → Docusaurus's own internal image handling.
 *
 * Duplicating the assets is not an option: 201 articles carry a `files/`, 186 an `images/`,
 * 84 MB in total, and they are code and screenshots — there is no reason for a second copy.
 *
 * # The fix
 *
 * Rewrite the `./`-relative references, in the translated file only, to point back at the
 * English article's folder. Because this plugin is registered FIRST in
 * `beforeDefaultRemarkPlugins`, both consumers above see an already-corrected path and neither
 * needs to know that translations exist. One place, no duplicated bytes, no symlink to maintain.
 *
 * English articles are left completely untouched — the plugin returns immediately for any file
 * that is not under an `i18n/<locale>/docusaurus-plugin-content-blog/` tree.
 *
 * See TODO 0119.
 */

const path = require("path");
const { visit } = require("unist-util-visit");

// i18n/<locale>/docusaurus-plugin-content-<kind>/<rest>
const I18N_CONTENT_RE =
  /(^|[/\\])i18n[/\\][^/\\]+[/\\]docusaurus-plugin-content-(blog|pages)(?:[/\\](.*))?$/;

// Where each content plugin's English source — and therefore its co-located assets — lives.
const SOURCE_ROOT_BY_KIND = {
  blog: "blog",
  pages: path.join("src", "pages"),
};

// Attributes that carry a path to a co-located asset, on any component.
const PATH_ATTRIBUTES = new Set(["source", "src"]);

/**
 * Maps the directory of a translated article to the directory of its English source.
 *
 * @returns {string|null} absolute path of the English article's directory, or null when the
 *   file is not a translation (the overwhelmingly common case — English articles).
 */
function englishSourceDir(currentFileDir, projectRoot) {
  const match = currentFileDir.match(I18N_CONTENT_RE);
  if (!match) return null;

  const [, , kind, rest] = match;
  const root = SOURCE_ROOT_BY_KIND[kind];
  if (!root) return null;

  // `rest` is undefined for a file sitting directly in the plugin folder — which is the normal
  // shape for a standalone page (`…/docusaurus-plugin-content-pages/about.mdx`), unlike blog
  // articles which always live one folder deeper.
  return path.join(projectRoot, root, rest ?? "");
}

/** Turns `./images/x.webp` into a relative path reaching the English article's folder. */
function rewrite(value, currentFileDir, englishDir) {
  if (typeof value !== "string") return value;
  if (!value.startsWith("./") && !value.startsWith("../")) return value;

  const target = path.resolve(englishDir, value);
  const relative = path.relative(currentFileDir, target);

  // path.relative drops the leading "./", which Markdown and the snippet loader both need in
  // order to treat the value as relative rather than project-root-relative.
  return relative.startsWith(".") ? relative : `./${relative}`;
}

function remarkI18nAssets() {
  return (tree, vfile) => {
    const currentFileDir = path.dirname(vfile.path);
    const projectRoot = process.cwd();
    const englishDir = englishSourceDir(currentFileDir, projectRoot);

    // Not a translation: nothing to do. This is the hot path for all 257 English articles.
    if (!englishDir) return;

    // Markdown images: ![alt](./images/x.webp)
    visit(tree, "image", (node) => {
      node.url = rewrite(node.url, currentFileDir, englishDir);
    });

    // Markdown links to a co-located file: [text](./files/x.txt)
    visit(tree, "link", (node) => {
      node.url = rewrite(node.url, currentFileDir, englishDir);
    });

    // Component props: <Snippet source="./files/x">, <img src="./images/x.webp">, ...
    for (const nodeType of ["mdxJsxFlowElement", "mdxJsxTextElement"]) {
      visit(tree, nodeType, (node) => {
        for (const attribute of node.attributes ?? []) {
          if (!PATH_ATTRIBUTES.has(attribute.name)) continue;
          attribute.value = rewrite(attribute.value, currentFileDir, englishDir);
        }
      });
    }
  };
}

module.exports = remarkI18nAssets;
