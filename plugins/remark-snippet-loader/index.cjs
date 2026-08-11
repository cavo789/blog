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
  // Prism has no "zsh" grammar: without these, a .zsh/.zshrc/.bashrc snippet
  // gets language-zsh / language-.zshrc and renders with zero highlighting.
  zsh: "bash",
  ".zshrc": "bash",
  ".bashrc": "bash",
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

// Resolves a `source="…"` attribute the same way for every consumer: a
// `./`/`../`-prefixed path is relative to the file that carries the
// attribute, anything else is relative to the project root. Exported so the
// Markdown-export plugin (plugins/markdown-export-plugin/degrade.cjs) can
// inline the very same files without re-deriving this rule.
function resolveSourcePath(sourcePath, currentFileDir, projectRoot = process.cwd()) {
  if (sourcePath.startsWith("./") || sourcePath.startsWith("../")) {
    return path.resolve(currentFileDir, sourcePath);
  }
  return path.resolve(projectRoot, sourcePath);
}

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
      const absolutePath = resolveSourcePath(sourcePath, currentFileDir, projectRoot);

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
            err,
          );
          rawContent = `Error loading source file: ${sourcePath}`;
        }
        // Replace self-closing node with one that has a single child holding the
        // file content. It must be an *expression* child, not a text child: MDX
        // applies JSX whitespace rules to text children, which trims the leading
        // spaces of every line and destroys the indentation of the terminal
        // output. An expression carrying a plain string literal is emitted
        // verbatim, so indentation survives.
        node.children = [
          {
            type: "mdxFlowExpression",
            value: JSON.stringify(rawContent),
            data: {
              estree: {
                type: "Program",
                sourceType: "module",
                comments: [],
                body: [
                  {
                    type: "ExpressionStatement",
                    expression: { type: "Literal", value: rawContent },
                  },
                ],
              },
            },
          },
        ];
        return;
      }

      // Snippet: existing logic — language detection, code injection, eli5.
      const filenameAttr = node.attributes.find((attr) => attr.name === "filename");

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
          } else if (baseName.includes("compose.yaml") || baseName.includes(".yml")) {
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
            console.warn(
              `Snippet plugin: could not parse ELI5 file ${eli5Path}:`,
              e.message,
            );
          }
        }
      } catch (err) {
        console.error(
          `Snippet plugin: error reading ${absolutePath} for blog post ${blogPostPath}`,
          err,
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

// Attached (not a named export) so the default-import used by
// docusaurus.config.js (`beforeDefaultRemarkPlugins: [remarkSnippetLoader, …]`)
// keeps seeing a plain callable plugin factory.
snippetLoader.resolveSourcePath = resolveSourcePath;

module.exports = snippetLoader;
