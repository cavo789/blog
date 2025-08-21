/**
 * @fileoverview
 * A Remark plugin for transforming Markdown image nodes (`![alt](url)`) into MDX-compatible `<Image />` components.
 *
 * This plugin is tailored for Docusaurus environments, where image paths often need to be resolved using `require()` or `useBaseUrl()`.
 * It supports:
 * - Relative paths (e.g. `./image.png`) → converted to `require()` expressions
 * - Absolute paths (e.g. `/img/banner.png`) → wrapped in `useBaseUrl()`
 * - External URLs → passed directly as string literals
 *
 * Additionally, it preserves `alt` and `title` attributes and injects the necessary import for `useBaseUrl` when used.
 *
 * @module remarkReplaceImgToImage
 */

const { visit } = require("unist-util-visit");
const acorn = require("acorn");

/**
 * Parses a JavaScript expression string into an ESTree-compatible expression node.
 *
 * @param {string} expression - A valid JavaScript expression as a string.
 * @returns {object} ESTree expression node representing the parsed expression.
 */
function expressionToEstree(expression) {
  return acorn.parse(expression, {
    ecmaVersion: 2020,
    sourceType: "module",
  }).body[0].expression;
}

/**
 * Creates an MDX JSX attribute node with an embedded JavaScript expression.
 *
 * @param {string} name - The name of the JSX attribute (e.g. "src").
 * @param {string} expr - A JavaScript expression string to embed in the attribute.
 * @returns {object} MDX AST node representing the JSX attribute with expression value.
 */
function makeJsxAttributeExpression(name, expr) {
  return {
    type: "mdxJsxAttribute",
    name,
    value: {
      type: "mdxJsxAttributeValueExpression",
      value: expr,
      data: {
        estree: {
          type: "Program",
          body: [
            {
              type: "ExpressionStatement",
              expression: expressionToEstree(expr),
            },
          ],
          sourceType: "module",
        },
      },
    },
  };
}

/**
 * Remark plugin that replaces Markdown image nodes with MDX `<Image />` components.
 *
 * @param {object} [options={}] - Plugin configuration options.
 * @param {boolean} [options.skipFirst=true] - Whether to skip transforming the first image node.
 * @returns {function} Transformer function to be used by Remark.
 */
function remarkReplaceImgToImage({ skipFirst = true } = {}) {
  return (tree) => {
    let imageCount = 0;
    let needsUseBaseUrlImport = false;

    visit(tree, "image", (node, index, parent) => {
      imageCount++;
      if (skipFirst && imageCount === 1) return;

      const url = node.url || "";
      const attributes = [
        { type: "mdxJsxAttribute", name: "alt", value: node.alt || "" },
      ];
      if (node.title)
        attributes.push({
          type: "mdxJsxAttribute",
          name: "title",
          value: node.title,
        });

      if (/^\.+\//.test(url)) {
        // Relative to MD file → use require()
        const expr = `require("${url}").default`;
        attributes.unshift(makeJsxAttributeExpression("src", expr));
      } else if (/^\//.test(url)) {
        // Absolute → useBaseUrl
        const expr = `useBaseUrl("${url}")`;
        attributes.unshift(makeJsxAttributeExpression("src", expr));
        needsUseBaseUrlImport = true;
      } else {
        // Fallback: external URL
        attributes.unshift({
          type: "mdxJsxAttribute",
          name: "src",
          value: url,
        });
      }

      const imageNode = {
        type: "mdxJsxFlowElement",
        name: "Image",
        attributes,
        children: [],
      };

      parent.children.splice(index, 1, imageNode);
    });

    if (needsUseBaseUrlImport) {
      tree.children.unshift({
        type: "mdxjsEsm",
        value: `import useBaseUrl from '@docusaurus/useBaseUrl';`,
        data: { estree: null },
      });
    }
  };
}

module.exports = remarkReplaceImgToImage;
