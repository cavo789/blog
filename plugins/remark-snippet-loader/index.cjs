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
    // The absolute path of the currently processed .mdx/blog/doc file
    const blogPostPath = vfile.path;
    // The directory of the .mdx/blog/doc file
    const currentFileDir = path.dirname(blogPostPath);
    // The Docusaurus project root (where docusaurus.config.js is located)
    const projectRoot = process.cwd();

    visit(tree, "mdxJsxFlowElement", (node) => {
      if (node.name !== "Snippet") return;

      const sourceAttr = node.attributes.find(attr => attr.name === "source");
      if (!sourceAttr || typeof sourceAttr.value !== "string") return;

      const sourcePath = sourceAttr.value;
      let absolutePath;

      // 🚀 CORRECTED PATH LOGIC:
      // 1. If the path starts with '.' (e.g., ./file.js or ../../file.js),
      //    it is treated as relative to the current MDX file.
      if (sourcePath.startsWith('./') || sourcePath.startsWith('../')) {
        absolutePath = path.resolve(currentFileDir, sourcePath);
      } else {
        // 2. Otherwise (e.g., src/components/...), it is treated as relative
        //    to the Docusaurus project root (process.cwd()).
        absolutePath = path.resolve(projectRoot, sourcePath);
      }

      try {
        const code = fs.readFileSync(absolutePath, "utf-8");

        // Determine extension for language detection
        const ext = path.extname(sourcePath).slice(1).toLowerCase() || path.basename(sourcePath).toLowerCase();

        let lang = extensionToLang[ext];
        if (!lang) {
            // Try to detect language based on the base file name (useful for Dockerfile, compose.yaml)
            const baseName = path.basename(sourcePath).toLowerCase();
            if (baseName === 'dockerfile') {
                lang = 'docker';
            } else if (baseName.includes('compose.yaml') || baseName.includes('.yml')) {
                lang = 'yaml';
            } else {
                lang = ext; // Use the extension or base name as fallback
            }
        }

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
          value: `// Error loading source file: ${sourcePath} (Resolved path: ${absolutePath})`,
        });
      }
    });
  };
}

module.exports = snippetLoader;
