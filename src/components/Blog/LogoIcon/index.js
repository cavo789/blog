import React from "react";
import { Icon } from "@iconify/react";

export default function LogoIcon({ name, size = 48 }) {
  return <Icon icon={`${name}`} width={size} height={size} />;
}
