import PropTypes from "prop-types";
import Terminal from "@site/src/components/Terminal";
import styles from "./styles.module.css";

// Wraps the repeated "install a CLI tool, then verify with --version" pattern
// found across several blog posts into a single component with consistent wording.
export default function Prerequisite({
  name,
  install,
  installOutput,
  check,
  checkOutput,
  typewriter = false,
}) {
  return (
    <div className={styles.wrapper}>
      <p className={styles.name}>
        Prerequisite: <code>{name}</code>
      </p>
      <Terminal typewriter={typewriter}>
        {`$ ${install}${installOutput ? `\n${installOutput}` : ""}`}
      </Terminal>
      <p className={styles.verify}>Verify:</p>
      <Terminal typewriter={typewriter}>
        {`$ ${check}${checkOutput ? `\n${checkOutput}` : ""}`}
      </Terminal>
    </div>
  );
}

Prerequisite.propTypes = {
  name: PropTypes.string.isRequired,
  install: PropTypes.string.isRequired,
  installOutput: PropTypes.string,
  check: PropTypes.string.isRequired,
  checkOutput: PropTypes.string,
  typewriter: PropTypes.bool,
};
