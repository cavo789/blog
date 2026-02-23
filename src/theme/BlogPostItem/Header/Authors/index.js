import React from "react";
import clsx from "clsx";
import { useBlogPost } from "@docusaurus/plugin-content-blog/client";
import BlogAuthor from "@theme/Blog/Components/Author";
import styles from "./styles.module.css";
// Component responsible for the authors layout
export default function BlogPostItemHeaderAuthors({ className }) {
  const {
    metadata: { authors },
    frontMatter,
    assets,
  } = useBlogPost();

  const allAuthors = [...authors];

  if (frontMatter.ai_assisted) {
    const geminiAuthor = {
      name: "Google Gemini",
      title: "AI Assistant",
      url: "https://gemini.google.com/",
      imageURL: "/img/gemini-logo.webp",
    };
    if (!allAuthors.find((a) => a.name === geminiAuthor.name)) {
      allAuthors.push(geminiAuthor);
    }
  }

  const authorsCount = allAuthors.length;
  if (authorsCount === 0) {
    return null;
  }
  const imageOnly = allAuthors.every(({ name }) => !name);
  const singleAuthor = allAuthors.length === 1;
  return (
    <div
      className={clsx(
        "margin-top--md margin-bottom--sm",
        imageOnly ? styles.imageOnlyAuthorRow : styles.authorsContainer,
        className,
      )}
    >
      {allAuthors.map((author, idx) => (
        <div
          className={clsx(
            imageOnly ? styles.imageOnlyAuthorCol : styles.authorCol,
          )}
          key={idx}
        >
          <BlogAuthor
            author={{
              ...author,
              // Handle author images using relative paths
              imageURL: assets.authorsImageUrls[idx] ?? author.imageURL,
            }}
          />
        </div>
      ))}
    </div>
  );
}
