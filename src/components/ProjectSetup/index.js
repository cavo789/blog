import React, { useState, Children, isValidElement } from "react";
import CodeBlock from "@theme/CodeBlock";
import Snippet from "@site/src/components/Snippet";
import Translate from "@docusaurus/Translate";
import JSZip from "jszip";
import styles from "./styles.module.css";

/**
 * Guideline Component
 * Minimalist component to capture post-install instructions.
 */
export const Guideline = () => {
  return null;
};
Guideline.isGuideline = true;

/**
 * EmptyFolder Component
 * Use this to ensure a specific empty directory is created.
 */
export const EmptyFolder = () => {
  return null;
};
EmptyFolder.isEmptyFolder = true;

/**
 * ProjectSetup Component
 *
 * A component that renders a list of files and provides tools to scaffold the project:
 * - View files with syntax highlighting.
 * - Generate a Bash "one-liner" to create the folder structure.
 * - Download the project as a ZIP file.
 *
 * @example
 * <ProjectSetup folderName="my-app">
 *   <EmptyFolder name="empty-dir" />
 *   <Guideline>npm install && npm start</Guideline>
 *   <Snippet filename="package.json" code={`{ "name": "app" }`} />
 *   <Snippet filename="index.js" code={`console.log("Hello");`} />
 * </ProjectSetup>
 */
export default function ProjectSetup({
  folderName = "my-project",
  files,
  children,
}) {
  const [showScript, setShowScript] = useState(false);
  const [expandAll, setExpandAll] = useState(false);
  const [copied, setCopied] = useState(false);

  const fileList = [];
  const guidelines = [];
  const folders = [];

  // 1. Handle legacy "files" prop (inline object)
  if (files) {
    Object.entries(files).forEach(([fileName, content]) => {
      fileList.push({ fileName, content });
    });
  }
  // 2. Handle children (Snippet or Guideline components)
  else if (children) {
    const processChildren = (nodes) => {
      Children.forEach(nodes, (child) => {
        if (isValidElement(child)) {
          if (child.type === Guideline || child.type?.isGuideline) {
            guidelines.push(child);
            return;
          }

          if (child.type === EmptyFolder || child.type?.isEmptyFolder) {
            if (child.props.name) {
              folders.push(child.props.name);
            }
            return;
          }

          // Check if this child is a Snippet or looks like a file definition.
          // We exclude HTML elements (like <div title="...">) from being treated as files via 'title'.
          const isFileComponent =
            child.type === Snippet ||
            child.props.filename ||
            (child.props.title && typeof child.type !== "string");

          if (isFileComponent) {
            const {
              filename,
              title,
              code,
              source,
              children: childChildren,
            } = child.props;

            const name = filename || title || "unknown";

            // The remark plugin injects the file content into the 'code' prop.
            // We prioritize 'code'. We do NOT use 'source' as content because it is just the file path.
            let content = code;

            if (!content && typeof childChildren === "string") {
              content = childChildren;
            }

            if (content) {
              fileList.push({ fileName: name, content, originalNode: child });
            }
          } else if (child.props.children) {
            // If not a file component, recurse (handles Fragments, divs, etc.)
            processChildren(child.props.children);
          }
        }
      });
    };
    processChildren(children);
  }

  // Helper to extract plain text from Guideline children (handles MDX wrapping like <p>)
  const getGuidelineText = (nodes) => {
    let text = "";
    Children.forEach(nodes, (child) => {
      if (typeof child === "string" || typeof child === "number") {
        text += child;
      } else if (isValidElement(child)) {
        text += getGuidelineText(child.props.children);
      }
    });
    return text;
  };

  /**
   * Generates a Bash script using heredocs (EOF)
   * to recreate the folder structure.
   */
  const generateShellScript = () => {
    let script = `mkdir -p ${folderName} && cd ${folderName}\n`;

    // Create explicit folders
    folders.forEach((f) => {
      script += `\nmkdir -p "${f}"\n`;
    });

    fileList.forEach(({ fileName, content }) => {
      const delimiter = "PROJECT_SETUP_EOF";
      script += `\nmkdir -p "$(dirname "${fileName}")" && cat <<'${delimiter}' > "${fileName}"\n${content.trim()}\n${delimiter}\n`;
    });

    script += `\necho "✅ Setup completed in folder: ${folderName}"`;

    if (guidelines.length > 0) {
      guidelines.forEach((g) => {
        const text = getGuidelineText(g.props.children)
          .trim()
          .replace(/\s+/g, " ");
        script += `\necho "🚀 ${text}"`;
      });
    }

    return script;
  };

  /**
   * Generates and triggers a ZIP download using JSZip.
   * Includes a README.md if guidelines are provided.
   */
  const downloadZip = async () => {
    if (fileList.length === 0 && folders.length === 0) {
      alert("No files or folders found to zip!");
      return;
    }

    const zip = new JSZip();
    // Remove leading slashes to ensure a valid zip folder path (fixes issues with "/tmp/...")
    const safeFolderName = folderName.replace(/^\/+/, "");
    const folder = zip.folder(safeFolderName);

    folders.forEach((f) => {
      folder.folder(f);
    });

    fileList.forEach(({ fileName, content }) => {
      folder.file(fileName, content.trim());
    });

    // Auto-generate a README for the ZIP archive
    if (guidelines.length > 0) {
      let readme = `# Project Setup: ${folderName}\n\n## Next Steps:\n\n`;
      guidelines.forEach((g) => {
        const text = getGuidelineText(g.props.children)
          .trim()
          .replace(/\s+/g, " ");
        readme += `- ${text}\n`;
      });
      folder.file("README.md", readme);
    }

    const blob = await zip.generateAsync({ type: "blob" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${folderName}.zip`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(generateShellScript());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.projectSetupContainer}>
      <div className={styles.header}>
        <strong>
          📦 <Translate>Project setup:</Translate> {folderName}
        </strong>
        <div className={styles.buttonGroup}>
          {showScript ? (
            <button
              className="button button--secondary button--sm"
              onClick={handleCopyScript}
            >
              {copied ? (
                <Translate>Copied!</Translate>
              ) : (
                <Translate>Copy</Translate>
              )}
            </button>
          ) : (
            <button
              className="button button--secondary button--sm"
              onClick={() => setExpandAll(!expandAll)}
            >
              {expandAll ? (
                <Translate>Collapse all</Translate>
              ) : (
                <Translate>Expand all</Translate>
              )}
            </button>
          )}
          <button
            className="button button--outline button--primary button--sm"
            onClick={downloadZip}
          >
            ZIP
          </button>
          <button
            className="button button--secondary button--sm"
            onClick={() => setShowScript(!showScript)}
          >
            {showScript ? (
              <Translate>View files</Translate>
            ) : (
              <Translate>Generate install script</Translate>
            )}
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {showScript ? (
          <div>
            <p>
              <small>
                <Translate>
                  Copy this block to your terminal (Linux/WSL2):
                </Translate>
              </small>
            </p>
            <div className={styles.scriptContainer}>
              <CodeBlock language="bash">{generateShellScript()}</CodeBlock>
            </div>
          </div>
        ) : (
          <div>
            <p className={styles.tip}>
              <small>
                <span aria-hidden="true">💡</span>{" "}
                <Translate id="theme.projectSetup.tip">
                  Click on the ZIP button to download the project as an archive
                  or click 'Generate install script' for a one-line command to
                  initialize this project in your console.
                </Translate>
              </small>
            </p>
            {fileList.map(({ fileName, content, originalNode }, index) => (
              <React.Fragment key={index}>
                {originalNode ? (
                  // Clone the element to ensure it receives the resolved content string
                  // (fixing the issue where it might just have the path string or a module object)
                  React.cloneElement(originalNode, {
                    code: content,
                    defaultOpen: expandAll,
                    key: `${index}-${expandAll}`,
                  })
                ) : (
                  <Snippet
                    filename={fileName}
                    code={content}
                    defaultOpen={expandAll}
                    key={`${index}-${expandAll}`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
