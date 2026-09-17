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
 * not exist, and the build fails — three times over, through three unrelated resolvers:
 *
 *   - `<Snippet source="./files/x">` → plugins/remark-snippet-loader, which resolves against
 *     `path.dirname(vfile.path)`;
 *   - `![](./images/x.webp)` → Docusaurus's own internal image handling;
 *   - `<img src={require("./images/x.webp").default} />` → webpack's resolver, on the
 *     compiled module. That one is a JSX *expression*, not a string, and needs its own pass.
 *
 * Duplicating the assets is not an option: 201 articles carry a `files/`, 186 an `images/`,
 * 84 MB in total, and they are code and screenshots — there is no reason for a second copy.
 *
 * # The fix
 *
 * Rewrite the `./`-relative references, in the translated file only, to point back at the
 * English article's folder. Because this plugin is registered FIRST in
 * `beforeDefaultRemarkPlugins`, all three consumers above see an already-corrected path and none
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

/**
 * Rewrites every relative string literal inside a JSX expression attribute — the
 * `<img src={require("./images/x.webp").default} />` shape, which the string branch above never
 * sees because the attribute's value is an `mdxJsxAttributeValueExpression` node, not a string.
 *
 * Both representations have to be updated: `value` is the raw source text, `data.estree` the
 * parsed program, and `@mdx-js` compiles from the estree when it is present. Leaving one behind
 * either changes nothing or makes the two disagree.
 *
 * Unlike the string branch, this applies to any attribute name: a `./`-relative literal inside an
 * expression is always a module specifier (`require`, `import`), never a label to display — so
 * there is no `filename="./files/.dockerignore"` equivalent to protect here.
 */
function rewriteExpressionAttribute(expression, currentFileDir, englishDir) {
  const apply = (value) => rewrite(value, currentFileDir, englishDir);

  // Raw source text: "./images/x.webp" or './images/x.webp'.
  if (typeof expression.value === "string") {
    expression.value = expression.value.replace(
      /(["'])(\.{1,2}\/[^"']*)\1/g,
      (match, quote, target) => `${quote}${apply(target)}${quote}`,
    );
  }

  // Parsed program: every string Literal, wherever it sits in the tree.
  const walk = (node) => {
    if (node === null || typeof node !== "object") return;
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }

    if (node.type === "Literal" && typeof node.value === "string") {
      const rewritten = apply(node.value);
      if (rewritten !== node.value) {
        node.value = rewritten;
        if (typeof node.raw === "string") {
          const quote = node.raw[0];
          node.raw = `${quote}${rewritten}${quote}`;
        }
      }
      return;
    }

    for (const key of Object.keys(node)) {
      // `parent` back-references would send the walk into an infinite loop.
      if (key === "parent") continue;
      walk(node[key]);
    }
  };

  walk(expression.data?.estree);
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
          // <img src={require("./images/x.webp").default} /> — an expression, not a string.
          if (attribute.value?.type === "mdxJsxAttributeValueExpression") {
            rewriteExpressionAttribute(attribute.value, currentFileDir, englishDir);
            continue;
          }

          if (!PATH_ATTRIBUTES.has(attribute.name)) continue;
          attribute.value = rewrite(attribute.value, currentFileDir, englishDir);
        }
      });
    }
  };
}

module.exports = remarkI18nAssets;
