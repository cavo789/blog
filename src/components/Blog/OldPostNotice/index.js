/**
 * OldPostNotice
 *
 * A Docusaurus blog component that displays a visual warning if the article
 * is older than one year. This helps readers understand that the content may
 * be outdated and should be interpreted with caution.
 *
 * Features:
 * - Uses `useBlogPost` to access the post's metadata and publication date.
 * - Calculates whether the post is older than one year.
 * - Renders a styled warning box using Docusaurus's alert classes and custom CSS.
 *
 * Usage:
 * Import and include this component inside your swizzled `BlogPostItem/Content/index.js`
 * to automatically show the notice on older posts.
 *
 * Styling:
 * Additional styles can be customized via `styles.module.css` in the same folder.
 */

import { useBlogPost } from '@docusaurus/plugin-content-blog/client';
import Translate from "@docusaurus/Translate";
import clsx from 'clsx';
import styles from './styles.module.css';

export default function OldPostNotice() {
  const { metadata } = useBlogPost();
  const publishedDate = new Date(metadata.date);
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const isOld = publishedDate < oneYearAgo;

  if (!isOld) {
    return null;
  }

  return (
    <div
      className={clsx("alert alert--warning", styles.oldPostNotice)}
      role="alert"
    >
      <p>
        <span aria-hidden="true">⚠️</span>{" "}
        <Translate
          id="blog.oldPostNotice.message"
          description="The warning message displayed on old blog posts"
        >
          This article is over a year old. The information may be outdated.
        </Translate>
      </p>
    </div>
  );
}
