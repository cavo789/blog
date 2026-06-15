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
      if (node.name !== "Snippet" && node.name !== "Terminal") return;

      const sourceAttr = node.attributes.find((attr) => attr.name === "source");
      if (!sourceAttr || typeof sourceAttr.value !== "string") return;

      const sourcePath = sourceAttr.value;
      let absolutePath;

      if (sourcePath.startsWith("./") || sourcePath.startsWith("../")) {
        absolutePath = path.resolve(currentFileDir, sourcePath);
      } else {
        absolutePath = path.resolve(projectRoot, sourcePath);
      }

      // Terminal: inject the file content as a text child of the node.
      // This reproduces exactly what <Terminal>...inline content...</Terminal> does,
      // avoiding any issues with JSX attribute serialisation of multi-line strings.
      if (node.name === "Terminal") {
        let rawContent;
        try {
          rawContent = fs.readFileSync(absolutePath, "utf-8");
        } catch (err) {
          console.error(
            `Terminal plugin: error reading ${absolutePath} for blog post ${blogPostPath}`,
            err
          );
          rawContent = `Error loading source file: ${sourcePath}`;
        }
        // Replace self-closing node with one that has a text child.
        node.children = [{ type: "text", value: rawContent }];
        return;
      }

      // Snippet: existing logic — language detection, code injection, eli5.
      const filenameAttr = node.attributes.find(
        (attr) => attr.name === "filename"
      );

      try {
        const code = fs.readFileSync(absolutePath, "utf-8");

        const pathForLang =
          filenameAttr && typeof filenameAttr.value === "string"
            ? filenameAttr.value
            : sourcePath;

        // Determine extension for language detection
        const ext =
          path.extname(pathForLang).slice(1).toLowerCase() ||
          path.basename(pathForLang).toLowerCase();

        let lang = extensionToLang[ext];
        if (!lang) {
          // Try to detect language based on the base file name (useful for Dockerfile, compose.yaml)
          const baseName = path.basename(pathForLang).toLowerCase();
          if (baseName === "dockerfile") {
            lang = "docker";
          } else if (
            baseName.includes("compose.yaml") ||
            baseName.includes(".yml")
          ) {
            lang = "yaml";
          } else {
            lang = ext; // Use the extension or base name as fallback
          }
        }

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

        // Auto-inject ELI5 explanations if a <source>.eli5.json file exists alongside the source
        const eli5Path = absolutePath + ".eli5.json";
        if (fs.existsSync(eli5Path)) {
          try {
            const eli5Raw = fs.readFileSync(eli5Path, "utf-8");
            const eli5Data = JSON.parse(eli5Raw);
            if (eli5Data.explanations && typeof eli5Data.explanations === "object") {
              node.attributes.push({
                type: "mdxJsxAttribute",
                name: "eli5json",
                value: JSON.stringify(eli5Data.explanations),
              });
            }
          } catch (e) {
            console.warn(`Snippet plugin: could not parse ELI5 file ${eli5Path}:`, e.message);
          }
        }
      } catch (err) {
        console.error(
          `Snippet plugin: error reading ${absolutePath} for blog post ${blogPostPath}`,
          err
        );
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
