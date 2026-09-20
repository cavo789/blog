import type { JSX, ReactNode } from "react";
import Translate from "@docusaurus/Translate";
import clsx from "clsx";
import styles from "./styles.module.css";
import {
  FaInfoCircle,
  FaRegStickyNote,
  FaLightbulb,
  FaExclamationTriangle,
  FaExclamationCircle,
  FaSkullCrossbones,
} from "react-icons/fa";

const variantMap = {
  info: {
    Icon: FaInfoCircle,
    label: <Translate id="blog.alertBox.info">Information</Translate>,
  },
  note: {
    Icon: FaRegStickyNote,
    label: <Translate id="blog.alertBox.note">Note</Translate>,
  },
  tip: {
    Icon: FaLightbulb,
    label: <Translate id="blog.alertBox.tip">Tip</Translate>,
  },
  caution: {
    Icon: FaExclamationTriangle,
    label: <Translate id="blog.alertBox.caution">Caution</Translate>,
  },
  important: {
    Icon: FaExclamationCircle,
    label: <Translate id="blog.alertBox.important">Important</Translate>,
  },
  highlyImportant: {
    Icon: FaExclamationTriangle,
    label: (
      <Translate id="blog.alertBox.highlyImportant">Highly Important</Translate>
    ),
  },
  coreConcept: {
    Icon: FaLightbulb,
    label: <Translate id="blog.alertBox.coreConcept">Core Concept</Translate>,
  },
  danger: {
    Icon: FaSkullCrossbones,
    label: <Translate id="blog.alertBox.danger">Danger</Translate>,
  },
};

type Variant = keyof typeof variantMap;

interface Props {
  variant?: Variant;
  title?: ReactNode;
  children: ReactNode;
}

/**
 * AlertBox displays a styled alert with an icon and a title.
 *
 * Markup change from the previous version (design harmonisation): the icon is
 * no longer a bare <svg> floated next to an <h4>. It sits in a filled .mk-dot —
 * the same 26px disc used by StepsCard's step bullets and Updated's timeline
 * nodes — and the title is an eyebrow label rather than a heading. Structure is
 * otherwise unchanged, so no MDX file needs editing.
 *
 * @example
 * <AlertBox variant="tip" title="Helpful Tip">
 *   Always write clean and readable code.
 * </AlertBox>
 */
export default function AlertBox({
  variant = "info",
  title,
  children,
}: Props): JSX.Element {
  const { Icon, label } = variantMap[variant] || variantMap.info;

  return (
    <div className={clsx(styles.alertBox, styles[variant])} role="note">
      <span className={styles.icon} aria-hidden="true">
        <Icon />
      </span>
      <div className={styles.body}>
        <p className={styles.title}>{title || label}</p>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
