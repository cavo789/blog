import PropTypes from "prop-types";
import styles from "./styles.module.css";
import useBaseUrl from '@docusaurus/useBaseUrl';

export default function Image({ src, alt, title }) {
  return (
    <div className={styles.container}><img src={useBaseUrl(src)} alt={alt} title={title}/></div>
  );
}

Image.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string,
  title: PropTypes.string,
};
