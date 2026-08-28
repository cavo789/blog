import type { JSX } from "react";
import clsx from "clsx";
import styles from "./styles.module.css";

interface Props {
  // Either a plain URL string, or a webpack `require('./file.zip')` result
  // (an object exposing the URL via `.default`).
  file?: string | { default: string };
  label?: string;
  title?: string;
}

export default function DownloadButton({
  file,
  label = "Download",
  title,
}: Props): JSX.Element | null {
  if (!file) {
    return null;
  }

  // Handle the case where the user passes `require('./file.zip')` directly
  // without appending `.default`. Cast to preserve the original (untyped) JS
  // behavior as-is — an object without `.default` was already unsupported.
  const fileUrl = (
    typeof file === "object" && file.default ? file.default : file
  ) as string;

  // Try to extract the file name to set the default download attribute
  const fileName = typeof fileUrl === "string" ? fileUrl.split("/").pop() : "download";

  return (
    <a
      href={fileUrl}
      download={fileName}
      className={clsx("button button--primary", styles.downloadButton)}
      title={title || `Download ${fileName}`}
    >
      <svg
        className={styles.downloadIcon}
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      {label}
    </a>
  );
}
