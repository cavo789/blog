import React, { useState, Children, isValidElement, useMemo, useCallback, useRef, useEffect } from "react";
import CodeBlock from "@theme/CodeBlock";
import Snippet from "@site/src/components/Snippet";
import Translate from "@docusaurus/Translate";
import JSZip from "jszip";
import styles from "./styles.module.css";

/**
 * Guideline Component
 * Minimalist component to capture post-install instructions.
 */
export const Guideline = () => null;
Guideline.isGuideline = true;

/**
 * EmptyFolder Component
 * Use this to ensure a specific empty directory is created.
 */
export const EmptyFolder = () => null;
EmptyFolder.isEmptyFolder = true;

// Extract plain text from Guideline children (handles MDX wrapping like <p>)
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
  createFolder = true,
  files,
  children,
}) {
  const [showScript, setShowScript] = useState(false);
  const [expandAll, setExpandAll] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [zipError, setZipError] = useState(null);
  const copiedTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    };
  }, []);

  // Parse children once; recalculate only when files or children change
  const { fileList, guidelines, folders } = useMemo(() => {
    const fileList = [];
    const guidelines = [];
    const folders = [];

    if (files) {
      Object.entries(files).forEach(([fileName, content]) => {
        fileList.push({ fileName, content });
      });
    } else if (children) {
      const processChildren = (nodes) => {
        Children.forEach(nodes, (child) => {
          if (!isValidElement(child)) return;

          if (child.type === Guideline || child.type?.isGuideline) {
            guidelines.push(child);
            return;
          }

          if (child.type === EmptyFolder || child.type?.isEmptyFolder) {
            if (child.props.name) folders.push(child.props.name);
            return;
          }

          // Exclude HTML elements (like <div title="...">) from being treated as files.
          const isFileComponent =
            child.type === Snippet ||
            child.props.filename ||
            (child.props.title && typeof child.type !== "string");

          if (isFileComponent) {
            const { filename, title, code, children: childChildren } = child.props;
            const name = filename || title || "unknown";
            // The remark plugin injects the file content into the 'code' prop.
            // We prioritize 'code'. We do NOT use 'source' as content because it is just the file path.
            let content = code;
            if (!content && typeof childChildren === "string") content = childChildren;
            if (content) fileList.push({ fileName: name, content, originalNode: child });
          } else if (child.props.children) {
            processChildren(child.props.children);
          }
        });
      };
      processChildren(children);
    }

    return { fileList, guidelines, folders };
  }, [files, children]);

  // Memoize the generated script so it isn't rebuilt on every UI state change
  const shellScript = useMemo(() => {
    let script = "";
    if (createFolder) {
      script += `mkdir -p "${folderName}" && cd "${folderName}"\n`;
    }

    folders.forEach((f) => {
      script += `\nmkdir -p "${f}"\n`;
    });

    fileList.forEach(({ fileName, content }) => {
      const delimiter = "PROJECT_SETUP_EOF";
      script += `\nmkdir -p "$(dirname "${fileName}")" && cat <<'${delimiter}' > "${fileName}"\n${content.trim()}\n${delimiter}\n`;
    });

    script += `\necho "✅ Setup completed in folder: ${folderName}"`;

    guidelines.forEach((g) => {
      const text = getGuidelineText(g.props.children).trim().replace(/\s+/g, " ");
      script += `\necho "🚀 ${text}"`;
    });

    return script;
  }, [createFolder, folderName, folders, fileList, guidelines]);

  const handleCopyScript = useCallback(() => {
    navigator.clipboard.writeText(shellScript);
    setCopied(true);
    if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    copiedTimerRef.current = setTimeout(() => setCopied(false), 2000);
  }, [shellScript]);

  const downloadZip = useCallback(async () => {
    if (fileList.length === 0 && folders.length === 0) {
      setZipError("No files or folders found to zip.");
      return;
    }
    setZipError(null);
    setIsDownloading(true);
    try {
      const zip = new JSZip();
      // Remove leading slashes to ensure a valid zip folder path (fixes issues with "/tmp/...")
      const safeFolderName = folderName.replace(/^\/+/, "");
      const folder = zip.folder(safeFolderName);

      folders.forEach((f) => folder.folder(f));
      fileList.forEach(({ fileName, content }) => folder.file(fileName, content.trim()));

      if (guidelines.length > 0) {
        let readme = `# Project Setup: ${folderName}\n\n## Next Steps:\n\n`;
        guidelines.forEach((g) => {
          const text = getGuidelineText(g.props.children).trim().replace(/\s+/g, " ");
          readme += `- ${text}\n`;
        });
        folder.file("README.md", readme);
      }

      const blob = await zip.generateAsync({ type: "blob" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${safeFolderName}.zip`;
      // Append to DOM before clicking for Firefox compatibility
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } finally {
      setIsDownloading(false);
    }
  }, [fileList, folders, folderName, guidelines]);

  return (
    <div className={styles.projectSetupContainer}>
      <div className={styles.header}>
        <strong>
          📦 <Translate>Project setup:</Translate> {folderName}
        </strong>
        <div className={styles.buttonGroup}>
          <a
            className="button button--secondary button--sm"
            href="/project_setup"
            target="_blank"
          >
            <Translate>Help</Translate>
          </a>
          {showScript ? (
            <button
              className="button button--secondary button--sm"
              onClick={handleCopyScript}
              aria-live="polite"
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
              onClick={() => setExpandAll((v) => !v)}
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
            disabled={isDownloading}
            aria-label="Download project as ZIP"
          >
            {isDownloading ? "⏳" : "ZIP"}
          </button>
          <button
            className="button button--secondary button--sm"
            onClick={() => setShowScript((v) => !v)}
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
        {zipError && (
          <p className={styles.error} role="alert">
            {zipError}
          </p>
        )}
        {showScript ? (
          <div>
            <p>
              <small>
                <Translate>
                  Copy this block to your terminal (Linux/WSL2).
                </Translate>
                {!createFolder && (
                  <mark>
                    {" "}
                    Make sure you are located in the{" "}
                    <strong>{folderName}</strong> folder.
                  </mark>
                )}
              </small>
            </p>
            <div className={styles.scriptContainer}>
              <CodeBlock language="bash">{shellScript}</CodeBlock>
            </div>
          </div>
        ) : (
          <div>
            <p className={styles.tip}>
              <small>
                <span aria-hidden="true">💡</span>{" "}
                <Translate id="theme.projectSetup.tip">
                  Need help here? Click the "Help" button above for setup
                  instructions.
                </Translate>
              </small>
            </p>
            {fileList.map(({ fileName, content, originalNode }, index) =>
              originalNode ? (
                React.cloneElement(originalNode, {
                  code: content,
                  defaultOpen: expandAll,
                  key: `${fileName || index}-${expandAll}`,
                })
              ) : (
                <Snippet
                  key={`${fileName || index}-${expandAll}`}
                  filename={fileName}
                  code={content}
                  defaultOpen={expandAll}
                />
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
