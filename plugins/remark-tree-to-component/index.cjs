const { visit } = require("unist-util-visit");

const mapLangToVariant = {
  apacheconf: "apacheconf",
  asm: "asm",
  bas: "vb",
  bash: "bash",
  bashrc: "bash",
  bat: "batch",
  batch: "batch",
  cjs: "js",
  cmd: "batch",
  css: "css",
  csv: "csv",
  diff: "diff",
  docker: "docker",
  gherkin: "gherkin",
  html: "html",
  ignore: "ignore",
  ini: "ini",
  java: "java",
  javascript: "js",
  js: "js",
  jsx: "js",
  json: "json",
  log: "log",
  makefile: "makefile",
  md: "md",
  mdx: "md",
  none: "none",
  pascal: "pascal",
  php: "php",
  powershell: "powershell",
  py: "python",
  python: "python",
  sh: "bash",
  sql: "sql",
  svg: "svg",
  toml: "toml",
  txt: "txt",
  vb: "vb",
  vbnet: "vbnet",
  xml: "xml",
  yaml: "yaml",
  yml: "yaml",
  zsh: "bash",
};

const variantIcons = {
  apacheconf: "logos:apache",
  asm: "vscode-icons:file-type-assembly",
  bash: "devicon:bash",
  batch: "file-icons:ms-dos",
  css: "ph:file-css",
  csv: "ph:file-csv",
  diff: "ph:git-diff",
  docker: "uil:docker",
  docusaurus: "logos:docusaurus",
  folder: "flat-color-icons:folder",
  gherkin: "skill-icons:gherkin-light",
  html: "ph:file-html",
  ignore: "codicon:sync-ignored",
  ini: "ph:file-ini",
  java: "vscode-icons:file-type-java",
  js: "logos:javascript",
  json: "ix:json-document",
  log: "ix:log",
  makefile: "vscode-icons:file-type-makefile",
  md: "ph:markdown-logo",
  none: "ph:empty",
  pascal: "file-icons:pascal",
  php: "bi:filetype-php",
  png: "ph:file-png-light",
  powershell: "file-icons:powershell",
  python: "devicon:python",
  sql: "ph:file-sql",
  svg: "ph:file-svg",
  toml: "tabler:toml",
  tsx: "ph:file-tsx-light",
  txt: "ph:file-txt",
  vb: "fluent:document-vb-16-regular",
  vbnet: "fluent:document-vb-16-regular",
  xml: "hugeicons:xml-01",
  yaml: "devicon-plain:yaml",
};

function getVariantKey(filename, type = "file") {
  if (type === "folder") return "folder";
  if (!filename) return "none";
  const lower = filename.toLowerCase();
  const base = lower.split("/").pop();

  if (base === "docusaurus.config.js") return "docusaurus";

  if (
    base === "dockerfile" ||
    base === "docker" ||
    base.endsWith(".docker") ||
    base.endsWith(".dockerfile") ||
    base.endsWith(".dockerignore") ||
    base.endsWith("compose.yaml") ||
    base.endsWith("compose.yml") ||
    base.endsWith("docker-compose.yaml")
  )
    return "docker";

  const ext = base.includes(".") ? base.split(".").pop() : "";
  return mapLangToVariant[ext] || "none";
}

function parseTree(treeText) {
  const lines = treeText
    .split("\n")
    .map((l) => l.replace(/\r$/, "")) // Remove \r for Windows
    .filter((l) => l.trim().length > 0 && !l.startsWith(".")); // Skip empty or hidden files

  const root = [];
  const stack = [{ depth: -1, children: root }]; // root in stack

  for (const line of lines) {
    // Match indentation + optional tree characters
    const match = line.match(/^(\s*[\│\s]*)?(?:├── |└── )?(.+)$/);
    if (!match) continue;

    const [, indentChars = "", nameRaw] = match;

    // Each level corresponds roughly to 4 spaces
    const depth = Math.floor(indentChars.replace(/[\│]/g, " ").length / 4);

    const name = nameRaw.replace(/[\│\├\└\─]+/g, "").trim();

    const node = {
      label: name,
      type: name.includes(".") ? "file" : "folder",
      children: [],
    };

    // Pop stack until we find the correct parent
    while (stack.length > 1 && depth <= stack[stack.length - 1].depth) {
      stack.pop();
    }

    // Add to parent's children
    stack[stack.length - 1].children.push(node);

    // If it's a folder, push it to the stack with its depth
    if (node.type === "folder") {
      stack.push({ depth, children: node.children });
    }
  }

  return root;
}

// Recursive conversion respecting children and nesting
function nodeToMdxElement(node, settings = {}) {
  const variantKey = getVariantKey(node.label, node.type);
  const icon = variantIcons[variantKey] || variantIcons.none;

  if (node.type === "folder") {
    return {
      type: "mdxJsxFlowElement",
      name: "Folder",
      attributes: [
        { type: "mdxJsxAttribute", name: "label", value: node.label },
        {
          type: "mdxJsxAttribute",
          name: "expanded",
          value: settings.expanded ?? false,
        },
        { type: "mdxJsxAttribute", name: "icon", value: icon },
      ],
      children: node.children.map((child) => nodeToMdxElement(child, settings)),
    };
  } else {
    return {
      type: "mdxJsxFlowElement",
      name: "File",
      attributes: [
        { type: "mdxJsxAttribute", name: "label", value: node.label },
        { type: "mdxJsxAttribute", name: "icon", value: icon },
      ],
      children: [],
    };
  }
}

function remarkTreeToComponent() {
  return (tree) => {
    visit(tree, "code", (node, index, parent) => {
      // Safe check for node.lang
      const lang = node.lang || "";
      if (!lang.startsWith("tree")) return;

      // Default settings
      const settings = { expanded: false };

      // Parse settings from code block meta (e.g., "tree expanded=true")
      const langParts = lang.split(/\s+/);
      if (langParts.length > 1) {
        langParts.slice(1).forEach((part) => {
          const [key, value] = part.split("=");
          if (key === "expanded") settings.expanded = value === "true";
          // Add more settings here if needed
        });
      }

      // Parse the nested tree text
      const parsed = parseTree(node.value);

      // Convert parsed nodes recursively
      const childrenMdx = parsed.map((child) => nodeToMdxElement(child, settings));

      // Wrap everything in a single <Trees> component
      const treesNode = {
        type: "mdxJsxFlowElement",
        name: "Trees",
        attributes: [],
        children: childrenMdx,
      };

      // Replace the code block with the MDX JSX node
      parent.children.splice(index, 1, treesNode);
    });
  };
}

module.exports = remarkTreeToComponent;