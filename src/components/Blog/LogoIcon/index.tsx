import type { JSX } from "react";
import { Icon, addCollection } from "@iconify/react";
import { iconCollections } from "./iconBundle.generated";

// Register the bundled icon data once, at module load time, so it is already available
// (synchronously, on both server and client) before the first <Icon> ever renders. This
// avoids the React hydration mismatch (#418) caused by @iconify/react's default behaviour
// of fetching icon data from its API asynchronously: SSR would render an empty placeholder
// while the client, once the fetch resolved, rendered the actual SVG.
Object.values(iconCollections).forEach((collection) => addCollection(collection));

interface Props {
  name: string;
  size?: number | string;
  className?: string;
  "aria-label"?: string;
}

export default function LogoIcon({
  name,
  size = 48,
  className,
  "aria-label": ariaLabel,
}: Props): JSX.Element {
  return (
    <Icon
      icon={name}
      ssr
      width={size}
      height={size}
      className={className}
      aria-label={ariaLabel}
    />
  );
}
