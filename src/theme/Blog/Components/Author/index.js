// Obtained using
// yarn swizzle @docusaurus/theme-classic Blog/Components/Author
// Just to apply 'loading="lazy"' to the <img>

import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import AuthorSocials from '@theme/Blog/Components/Author/Socials';
import Heading from '@theme/Heading';
import styles from './styles.module.css';
function MaybeLink(props) {
  if (props.href) {
    return <Link {...props} />;
  }
  return <>{props.children}</>;
}
MaybeLink.propTypes = {
  href: PropTypes.string,
  children: PropTypes.node,
};
function AuthorTitle({title}) {
  return (
    <small className={styles.authorTitle} title={title}>
      {title}
    </small>
  );
}
AuthorTitle.propTypes = {
  title: PropTypes.string,
};
function AuthorName({name, as}) {
  if (!as) {
    return <span className={styles.authorName}>{name}</span>;
  } else {
    return (
      <Heading as={as} className={styles.authorName}>
        {name}
      </Heading>
    );
  }
}
AuthorName.propTypes = {
  name: PropTypes.string,
  as: PropTypes.elementType,
};
function AuthorBlogPostCount({count}) {
  return <span className={clsx(styles.authorBlogPostCount)}>{count}</span>;
}
AuthorBlogPostCount.propTypes = {
  count: PropTypes.number,
};
// Note: in the future we might want to have multiple "BlogAuthor" components
// Creating different display modes with the "as" prop may not be the best idea
// Explainer: https://kyleshevlin.com/prefer-multiple-compositions/
// For now, we almost use the same design for all cases, so it's good enough
export default function BlogAuthor({as, author, className, count}) {
  const {name, title, url, imageURL, email, page} = author;
  const link =
    page?.permalink || url || (email && `mailto:${email}`) || undefined;
  return (
    <div
      className={clsx(
        'avatar margin-bottom--sm',
        className,
        styles[`author-as-${as}`],
      )}>
      {imageURL && (
        <MaybeLink href={link} className="avatar__photo-link">
          <img
            className={clsx('avatar__photo', styles.authorImage)}
            loading="lazy"
            src={imageURL}
            alt={name}
          />
        </MaybeLink>
      )}

      {(name || title) && (
        <div className={clsx('avatar__intro', styles.authorDetails)}>
          <div className="avatar__name">
            {name && (
              <MaybeLink href={link}>
                <AuthorName name={name} as={as} />
              </MaybeLink>
            )}
            {count !== undefined && <AuthorBlogPostCount count={count} />}
          </div>
          {!!title && <AuthorTitle title={title} />}

          {/*
              We always render AuthorSocials even if there's none
              This keeps other things aligned with flexbox layout
            */}
          <AuthorSocials author={author} />
        </div>
      )}
    </div>
  );
}
BlogAuthor.propTypes = {
  as: PropTypes.elementType,
  author: PropTypes.shape({
    name: PropTypes.string,
    title: PropTypes.string,
    url: PropTypes.string,
    imageURL: PropTypes.string,
    email: PropTypes.string,
    page: PropTypes.shape({
      permalink: PropTypes.string,
    }),
  }).isRequired,
  className: PropTypes.string,
  count: PropTypes.number,
};
