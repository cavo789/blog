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
import clsx from 'clsx';
import styles from './styles.module.css';

export default function OldPostNotice() {
  const { metadata } = useBlogPost();
  const publishedDate = new Date(metadata.date);
  const oneYearAgo = new Date(new Date().setFullYear(new Date().getFullYear() - 1));

  const isOld = publishedDate < oneYearAgo;

  return (
    isOld && (
      <div className={clsx('alert alert--warning', styles.oldPostNotice)}>
        <p>
          ⚠️ This article is over a year old. The information may be outdated.
        </p>
      </div>
    )
  );
}
