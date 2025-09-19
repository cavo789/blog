const fs = require("fs");
const path = require("path");
const { visit } = require("unist-util-visit");

const extensionToLang = {
  js: "javascript",
  jsx: "jsx",
  ts: "typescript",
  tsx: "typescript",
  py: "python",
  php: "php",
  sh: "bash",
  bash: "bash",
  css: "css",
  html: "html",
  json: "json",
  yml: "yaml",
  yaml: "yaml",
  md: "markdown",
  dockerfile: "docker",
  ini: "ini",
  sql: "sql",
  xml: "xml",
  // Add more as needed
};

function snippetLoader() {
  return (tree, vfile) => {
    const blogPostPath = vfile.path;
    visit(tree, "mdxJsxFlowElement", (node) => {
      if (node.name !== "Snippet") return;

      const sourceAttr = node.attributes.find(attr => attr.name === "source");
      if (!sourceAttr || typeof sourceAttr.value !== "string") return;

      const sourcePath = sourceAttr.value;
      const absolutePath = path.resolve(process.cwd(), sourcePath);

      try {
        const code = fs.readFileSync(absolutePath, "utf-8");
        const ext = path.extname(sourcePath).slice(1).toLowerCase();
        const lang = extensionToLang[ext] || ext;

        // console.log(`Snippet plugin: reading ${absolutePath} for blog post ${blogPostPath}, auto-detected language is ${lang}`);

        node.attributes.push({
          type: "mdxJsxAttribute",
          name: "code",
          value: code,
        });

        node.attributes.push({
          type: "mdxJsxAttribute",
          name: "lang",
          value: lang,
        });
      } catch (err) {
        console.error(`Snippet plugin: error reading ${absolutePath} for blog post ${blogPostPath}`, err);
        node.attributes.push({
          type: "mdxJsxAttribute",
          name: "code",
          value: `// Error loading source file: ${sourcePath}`,
        });
      }
    });
  };
}

module.exports = snippetLoader;
