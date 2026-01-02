import React from 'react';
import PropTypes from 'prop-types';
import Translate from "@docusaurus/Translate";
import clsx from "clsx";
import styles from './styles.module.css';
import {
  FaInfoCircle,
  FaRegStickyNote,
  FaLightbulb,
  FaExclamationTriangle,
  FaExclamationCircle,
} from 'react-icons/fa';

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
};

/**
 * AlertBox component displays a styled alert message with an icon and title.
 * It supports multiple variants such as info, note, tip, caution, and important.
 *
 * @component
 * @example
 * <AlertBox variant="tip" title="Helpful Tip">
 *   Always write clean and readable code.
 * </AlertBox>
 *
 * @param {Object} props
 * @param {'info'|'note'|'tip'|'caution'|'important'} [props.variant='info'] - Type of alert to display.
 * @param {string} [props.title] - Custom title for the alert. Defaults to variant's title.
 * @param {React.ReactNode} props.children - Content to display inside the alert box.
 */
export default function AlertBox({ variant = "info", title, children }) {
  const { Icon, label } = variantMap[variant] || variantMap.info;

  return (
    <div className={clsx(styles.alertBox, styles[variant])} role="note">
      <div className={styles.header}>
        <Icon className={styles.icon} aria-hidden="true" />
        <h4>{title || label}</h4>
      </div>
      <div className={styles.content}>{children}</div>
    </div>
  );
}

AlertBox.propTypes = {
  variant: PropTypes.oneOf(Object.keys(variantMap)),
  title: PropTypes.node,
  children: PropTypes.node.isRequired,
};
