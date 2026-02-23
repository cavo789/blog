import React from 'react';
import styles from './index.module.css';

const AIIcon = () => {
  return (
    <div className={styles.aiIcon} title="This post was written with the help of AI">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.icon}>
        <path d="M12 8V4H8" />
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <path d="M6 12h4" />
        <path d="M14 12h4" />
        <path d="M12 12v4" />
      </svg>
      <span>AI Assisted</span>
    </div>
  );
};

export default AIIcon;
