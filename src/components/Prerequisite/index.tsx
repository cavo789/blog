import type { JSX } from "react";
import Terminal from "@site/src/components/Terminal";
import styles from "./styles.module.css";
import Translate from "@docusaurus/Translate";

interface Props {
  name: string;
  install: string;
  installOutput?: string;
  check: string;
  checkOutput?: string;
  typewriter?: boolean;
}

// Wraps the repeated "install a CLI tool, then verify with --version" pattern
// found across several blog posts into a single component with consistent wording.
export default function Prerequisite({
  name,
  install,
  installOutput,
  check,
  checkOutput,
  typewriter = false,
}: Props): JSX.Element {
  return (
    <div className={styles.wrapper}>
      <p className={styles.name}>
        <Translate id="prerequisite.label" values={{ name: <code>{name}</code> }}>
          {"Prerequisite: {name}"}
        </Translate>
      </p>
      <Terminal typewriter={typewriter}>
        {`$ ${install}${installOutput ? `\n${installOutput}` : ""}`}
      </Terminal>
      <p className={styles.verify}>
        <Translate id="prerequisite.verify">Verify:</Translate>
      </p>
      <Terminal typewriter={typewriter}>
        {`$ ${check}${checkOutput ? `\n${checkOutput}` : ""}`}
      </Terminal>
    </div>
  );
}
