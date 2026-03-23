import React from "react";
import clsx from "clsx";
import styles from "./styles.module.css";

export default function DownloadButton({ file, label = "Download", title }) {
  if (!file) {
    return null;
  }

  // Handle the case where the user passes `require('./file.zip')`
  // directly without appending `.default`
  const fileUrl =
    typeof file === "object" && file.default ? file.default : file;

  // Try to extract the file name to set the default download attribute
  const fileName =
    typeof fileUrl === "string" ? fileUrl.split("/").pop() : "download";

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
