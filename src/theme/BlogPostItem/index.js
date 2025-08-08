import React from 'react';
import clsx from 'clsx';
import {useBlogPost} from '@docusaurus/plugin-content-blog/client';
import BlogPostItemContainer from '@theme/BlogPostItem/Container';
import BlogPostItemHeader from '@theme/BlogPostItem/Header';
import BlogPostItemContent from '@theme/BlogPostItem/Content';
import BlogPostItemFooter from '@theme/BlogPostItem/Footer';

// apply a bottom margin in list view
function useContainerClassName() {
  const {isBlogPostPage} = useBlogPost();
  return !isBlogPostPage ? 'margin-bottom--xl' : undefined;
}

const BlueSkyShare = ({ title, url }) => {
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = 'https://www.avonture.be' + encodeURIComponent(url);
  const shareLink = `https://bsky.app/intent/compose?text=${encodedTitle}%20${encodedUrl}`;

  return (
     <div style={{ borderTop: '1px solid #eee', marginTop: '2rem', paddingTop: '1.5rem' }}>
      <a
        href={shareLink}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.4rem 0.9rem',
          backgroundColor: '#f5f5f5',       // Light neutral background
          color: '#333333',                 // Dark grey text (less harsh than black)
          fontWeight: '400',                // Normal weight
          fontSize: '0.9rem',               // Slightly smaller
          borderRadius: '6px',              // Softer rounding
          textDecoration: 'none',
          transition: 'background-color 0.2s ease, color 0.2s ease',
          boxShadow: 'none',                // Remove shadow for minimal look
          border: '1px solid #ddd'          // Subtle border instead of s
        }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#0062cc'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#007aff'}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 100 100"
          width="20"
          height="20"
          fill="white"
        >
          <path d="M50,15C29.9,15,13.2,31.7,13.2,51.8c0,11.7,4.6,22.2,12.1,30c0.9,0.9,2.5,0.8,3.3-0.2l7.8-9.2c0.8-0.9,0.7-2.4-0.2-3.2 c-4.2-3.7-6.9-9.1-6.9-15.1c0-11.2,9-20.3,20.3-20.3s20.3,9,20.3,20.3c0,6-2.7,11.4-6.9,15.1c-0.9,0.8-1,2.3-0.2,3.2l7.8,9.2 c0.8,0.9,2.4,1.1,3.3,0.2c7.5-7.8,12.1-18.3,12.1-30C86.8,31.7,70.1,15,50,15z"/>
        </svg>
        Share on BlueSky
      </a>
    </div>
  );
};

export default function BlogPostItem({children, className}) {
  const {metadata} = useBlogPost();
  const containerClassName = useContainerClassName();
  return (
    <BlogPostItemContainer className={clsx(containerClassName, className)}>
      <BlogPostItemHeader />
      <BlogPostItemContent>{children}</BlogPostItemContent>
      <BlogPostItemFooter />
      <BlueSkyShare title={metadata.title} url={metadata.permalink}/>
    </BlogPostItemContainer>
  );
}
