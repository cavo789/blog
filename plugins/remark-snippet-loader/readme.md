# Docusaurus Remark Snippet Loader

This Docusaurus Remark plugin allows you to embed the contents of any file—be it source code, configuration files, or markdown—directly into your `.mdx` documents using a simple `<Snippet>` tag.

The plugin handles file loading during the build process, reducing boilerplate and ensuring the displayed code is always synchronized with the source file.

## ⚙️ Installation and Setup

1. **Plugin Placement**: Place the plugin code inside your project at the specified path: `plugins/remark-snippet-loader/index.cjs`

2. **Docusaurus Configuration**: Register the plugin in your `docusaurus.config.js`:

```javascript
// docusaurus.config.js

import remarkSnippetLoader from "./plugins/remark-snippet-loader/index.cjs";
// ... other config

const config = {
  // ... other config
  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        // ... other config
        blog: {
          // ... other config
          beforeDefaultRemarkPlugins: [
            remarkSnippetLoader,
            // ... other config
          ],
        },
        // ... other config
      }),
    ],
  ],
  // ... other config
};

export default config;

```

## 🧩 Required Snippet Component

This plugin works by injecting the content of the source file (`code`) and the detected language (`lang`) as props into an MDX component named `<Snippet>`.

You must create this component in your project's components directory: `src/components/Snippet/index.js`.

A minimal version of this component should accept the `code`, `lang` and `filename` props and render them, typically using Docusaurus's built-in `CodeBlock` component for syntax highlighting.

## 🚀 Usage

Use the `<Snippet>` component in any `.mdx` file:

```markdown
<Snippet filename=".devcontainer/compose.yaml" source="./static/compose.yaml" />
```

| Attribute | Description |
| --- | --- |
| `source` | Required. The path to the file you want to embed. |
| `filename` | Optional. The file name to display above the code block. |

## 📁 Path Resolution Logic

The plugin is designed to support two primary path resolution modes based on the value of the `source` attribute:

### **1. Relative to the MDX File**

If the source path starts with `./` or `../`, the path is resolved relative to the directory of the `.mdx` file you are currently editing.

* **Syntax Example**:

    `<Snippet filename="config.json" source="./assets/config.json" />`

* **Use Case**: Ideal for loading files that are local to a specific documentation article, such as example data or images placed next to the doc file.

### **2. Relative to the Docusaurus Root Folder**

If the `source` path does not start with a dot (`.` or `..`), the path is resolved relative to the Docusaurus project root (`process.cwd()`, where `docusaurus.config.js` is located).

* **Syntax Example:**

    `<Snippet sourcefilename="share.js" ="src/components/Bluesky/share.js" />`

* **Use Case**: Essential for embedding core files that reside outside the documentation directory, such as source code components, public assets, or top-level configuration files (`package.json`, etc.).
