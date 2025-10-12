import React from 'react';
import PropTypes from 'prop-types';
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
    icon: FaInfoCircle,
    defaultTitle: 'Information',
    light: {
      bg: '#eef8ff',
      border: '#48a4ff',
      color: '#11334c',
      iconColor: '#3182ce',
    },
    dark: {
      bg: '#1a2b3c',
      border: '#48a4ff',
      color: '#cbe7ff',
      iconColor: '#63b3ed',
    }
  },
  note: {
    icon: FaRegStickyNote,
    defaultTitle: 'Note',
    /* ...colors here */
  },
  tip: {
    icon: FaLightbulb,
    defaultTitle: 'Tip',
    /* ...colors here */
  },
  caution: {
    icon: FaExclamationTriangle,
    defaultTitle: 'Caution',
    /* ...colors here */
  },
  important: {
    icon: FaExclamationCircle,
    defaultTitle: 'Important',
    /* ...colors here */
  },
  highlyImportant: {
    icon: FaExclamationTriangle,
    defaultTitle: 'Highly Important',
    light: {
      bg: '#ffebee',
      borderLeft: '#e53935',
      border: '#f44336',
      color: '#3e2723',
      iconColor: '#e53935',
      titleColor: '#b71c1c',
    },
    dark: {
      bg: '#4a1b1b',
      borderLeft: '#e53935',
      border: '#f44336',
      color: '#f9c5c5',
      iconColor: '#ef5350',
      titleColor: '#ff8a80',
    }
  },
  coreConcept: {
    icon: FaLightbulb,
    defaultTitle: 'Core Concept',
    light: {
      bg: '#fffbe6',
      borderLeft: '#f9c846',
      color: '#333',
      iconColor: '#f9c846',
      titleColor: '#333',
    },
    dark: {
      bg: '#363636',
      borderLeft: '#ffda79',
      color: '#e0e0e0',
      iconColor: '#ffda79',
      titleColor: '#e0e0e0',
    },
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
export default function AlertBox({ variant = 'info', title, children }) {
  const variantData = variantMap[variant] || variantMap.info;
  const Icon = variantData.icon;
  const finalTitle = title || variantData.defaultTitle;

  return (
    <div className={`${styles.alertBox} ${styles[variant]}`}>
      <div className={styles.header}>
        <Icon className={styles.icon} style={{ color: variantData.iconColor }} />
        <h4 style={variant === 'highlyImportant' ? { color: variantData.titleColor } : undefined}>
          {finalTitle}
        </h4>
      </div>
      <div className={styles.content} style={{ color: variantData.color }}>
        {children}
      </div>
    </div>
  );
}

AlertBox.propTypes = {
  variant: PropTypes.oneOf(Object.keys(variantMap)),
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
};
