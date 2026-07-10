import React from "react";
import PropTypes from "prop-types";
import { Icon } from "@iconify/react";

export default function LogoIcon({ name, size = 48, className, "aria-label": ariaLabel }) {
  return <Icon icon={name} width={size} height={size} className={className} aria-label={ariaLabel} />;
}

LogoIcon.propTypes = {
  name: PropTypes.string.isRequired,
  size: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  className: PropTypes.string,
  "aria-label": PropTypes.string,
};
