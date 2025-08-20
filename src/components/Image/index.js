import PropTypes from "prop-types";
import styles from "./styles.module.css";
import useBaseUrl from "@docusaurus/useBaseUrl";

export default function Image({ img, alt, title }) {
  return (
    <div className={styles.container}>
      <img src={useBaseUrl(img)} alt={alt} title={title} lazy="loading" />
    </div>
  );
}

Image.propTypes = {
  img: PropTypes.string.isRequired,
  alt: PropTypes.string,
  title: PropTypes.string,
};
